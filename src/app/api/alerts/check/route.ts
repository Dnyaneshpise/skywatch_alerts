import { NextResponse } from "next/server";
import { firestoreRequest, firestoreRunQuery, fromFirestoreFields, toFirestoreFields, type FirestoreDocument } from "@/lib/server/firebaseRest";
import { isAlertExpired, shouldSkipRecentlyTriggered } from "@/lib/server/alerts";
import { sendAlertNotification } from "@/lib/server/notifications";
import type { FlightAlert } from "@/types/alert";

export const runtime = "nodejs";

type QueryResult = {
  document?: FirestoreDocument;
};

type AdsbAircraft = {
  flight?: string;
  callsign?: string;
  t?: string;
  lat?: number;
  lon?: number;
};

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("x-cron-secret") !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await firestoreRunQuery<QueryResult[]>({
      structuredQuery: {
        from: [{ collectionId: "alerts", allDescendants: true }],
      },
    });

    const alerts = results
      .filter((result) => result.document)
      .map((result) => toAlert(result.document as FirestoreDocument))
      .filter((alert) => alert.active && !isAlertExpired(alert) && !shouldSkipRecentlyTriggered(alert));

    const checked = [];

    for (const alert of alerts) {
      const response = await fetch(`https://api.adsb.lol/v2/point/${alert.lat}/${alert.lon}/${alert.distance}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "SkyWatchAlerts/1.0",
        },
        cache: "no-store",
      });

      if (!response.ok) continue;
      const data = (await response.json()) as { ac?: AdsbAircraft[] };
      const flights = (data.ac ?? [])
        .filter((flight) => typeof flight.lat === "number" && typeof flight.lon === "number")
        .map((flight) => ({
          flight: flight.flight?.trim(),
          callsign: flight.callsign?.trim(),
          type: flight.t,
          lat: flight.lat as number,
          lon: flight.lon as number,
        }));

      if (flights.length === 0) continue;

      try {
        const provider = await sendAlertNotification(alert, flights);
        const lastTriggeredAt = new Date().toISOString();
        await firestoreRequest(`users/${alert.userId}/alerts/${alert.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            fields: toFirestoreFields({ ...alert, lastTriggeredAt, updatedAt: lastTriggeredAt }),
          }),
        });
        checked.push({ alertId: alert.id, matches: flights.length, provider, sent: true });
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
    const message = error instanceof Error ? error.message : "Unexpected alert check error";
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
