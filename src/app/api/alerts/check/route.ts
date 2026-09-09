import { NextResponse } from "next/server";
import {
  firestoreRequest,
  firestoreRunQuery,
  fromFirestoreFields,
  toFirestoreFields,
  type FirestoreDocument,
} from "@/lib/server/firebaseRest";
import {
  isAlertExpired,
  shouldSkipRecentlyTriggered,
} from "@/lib/server/alerts";
import { sendAlertNotification } from "@/lib/server/notifications";
import type { FlightAlert } from "@/types/alert";

export const runtime = "nodejs";

type QueryResult = {
  document?: FirestoreDocument;
};

type AdsbAircraft = {
  hex?: string;
  flight?: string;
  callsign?: string;
  t?: string;
  r?: string;
  category?: string;
  lat?: number;
  lon?: number;
};

export async function GET(request: Request) {
  return checkAlerts(request);
}

export async function POST(request: Request) {
  return checkAlerts(request);
}

async function checkAlerts(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const bearerSecret = authorization?.replace(/^Bearer\s+/i, "");
  if (
    cronSecret &&
    request.headers.get("x-cron-secret") !== cronSecret &&
    bearerSecret !== cronSecret
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await firestoreRunQuery<QueryResult[]>({
      structuredQuery: {
        from: [{ collectionId: "alerts", allDescendants: true }],
      },
    });

    const allAlerts = results
      .filter((result) => result.document)
      .map((result) => toAlert(result.document as FirestoreDocument));

    const checked = [];
    const alerts = allAlerts.filter((alert) => {
      if (!alert.active) {
        checked.push({
          alertId: alert.id,
          sent: false,
          reason: "Alert is disabled",
        });
        return false;
      }
      if (isAlertExpired(alert)) {
        checked.push({
          alertId: alert.id,
          sent: false,
          reason: "Alert has expired",
          expiresAt: alert.expiresAt,
        });
        return false;
      }
      if (shouldSkipRecentlyTriggered(alert)) {
        checked.push({
          alertId: alert.id,
          sent: false,
          reason: "Cooldown is active",
          lastTriggeredAt: alert.lastTriggeredAt,
        });
        return false;
      }
      return true;
    });

    for (const alert of alerts) {
      const flightsUrl = new URL("/api/flights", request.url);
      flightsUrl.searchParams.set("lat", String(alert.lat));
      flightsUrl.searchParams.set("lon", String(alert.lon));
      flightsUrl.searchParams.set("radius", String(alert.distance));
      const response = await fetch(flightsUrl, { cache: "no-store" });

      if (!response.ok) {
        checked.push({
          alertId: alert.id,
          sent: false,
          error: `Flight API returned ${response.status}`,
        });
        continue;
      }
      const data = (await response.json()) as { ac?: AdsbAircraft[] };
      const flights = (data.ac ?? [])
        .filter(
          (flight) =>
            typeof flight.lat === "number" && typeof flight.lon === "number",
        )
        .filter(
          (flight) =>
            distanceInKm(
              alert.lat,
              alert.lon,
              flight.lat as number,
              flight.lon as number,
            ) <= alert.distance,
        )
        .filter((flight) => aircraftMatchesAlert(alert, flight))
        .map((flight) => ({
          flight: flight.flight?.trim(),
          callsign: flight.callsign?.trim(),
          type: flight.t,
          lat: flight.lat as number,
          lon: flight.lon as number,
        }));

      if (flights.length === 0) {
        checked.push({
          alertId: alert.id,
          matches: 0,
          sent: false,
          reason: "No matching aircraft in alert radius",
        });
        continue;
      }

      try {
        const provider = await sendAlertNotification(alert, flights);
        const lastTriggeredAt = new Date().toISOString();
        await firestoreRequest(`users/${alert.userId}/alerts/${alert.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            fields: toFirestoreFields({
              ...alert,
              lastTriggeredAt,
              updatedAt: lastTriggeredAt,
            }),
          }),
        });
        checked.push({
          alertId: alert.id,
          matches: flights.length,
          provider,
          sent: true,
        });
      } catch (error) {
        checked.push({
          alertId: alert.id,
          matches: flights.length,
          sent: false,
          error: error instanceof Error ? error.message : "Notification failed",
        });
      }
    }

    return NextResponse.json({ checked });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected alert check error";
    const setupProblem =
      message.includes("FIREBASE_SERVICE_ACCOUNT") ||
      message.includes("Bad control character") ||
      message.includes("Failed to create Firebase service token") ||
      message.includes("private_key");

    return NextResponse.json(
      {
        error: setupProblem
          ? `Alert check setup error: ${message}. Re-create FIREBASE_SERVICE_ACCOUNT as base64 from the downloaded Firebase service-account JSON, then restart npm run dev.`
          : message,
      },
      { status: setupProblem ? 503 : 500 },
    );
  }
}

function toAlert(document: FirestoreDocument) {
  return {
    id: document.name.split("/").pop() ?? document.name,
    ...fromFirestoreFields(document.fields),
  } as FlightAlert;
}

function aircraftMatchesAlert(alert: FlightAlert, flight: AdsbAircraft) {
  const selectedTypes = alert.aircraftTypes?.length
    ? alert.aircraftTypes
    : [alert.type ?? "any"];
  if (selectedTypes.includes("any")) return true;

  const category = flight.category ?? "";
  const callsign = (flight.flight || flight.callsign || "")
    .trim()
    .toUpperCase();
  const registration = (flight.r || "").trim().toUpperCase();

  return selectedTypes.some((type) => {
    if (type === "commercial") {
      return (
        category.startsWith("A") || Boolean(callsign.match(/^[A-Z]{2,3}\d/))
      );
    }

    if (type === "private") {
      return (
        registration.startsWith("N") || ["A1", "A2", "A3"].includes(category)
      );
    }

    if (type === "military") {
      return ["MIL", "RCH", "IAM", "ASY", "VV", "AF", "NAVY"].some((prefix) =>
        callsign.startsWith(prefix),
      );
    }

    return false;
  });
}

function distanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371;
  const latitudeDelta = ((lat2 - lat1) * Math.PI) / 180;
  const longitudeDelta = ((lon2 - lon1) * Math.PI) / 180;
  const latitude1 = (lat1 * Math.PI) / 180;
  const latitude2 = (lat2 * Math.PI) / 180;
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.sin(longitudeDelta / 2) ** 2 *
      Math.cos(latitude1) *
      Math.cos(latitude2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
