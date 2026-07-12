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
        where: {
          fieldFilter: {
            field: { fieldPath: "active" },
            op: "EQUAL",
            value: { booleanValue: true },
          },
        },
      },
    });

    const alerts = results
      .filter((result) => result.document)
      .map((result) => toAlert(result.document as FirestoreDocument))
      .filter((alert) => !isAlertExpired(alert) && !shouldSkipRecentlyTriggered(alert));

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

      const provider = await sendAlertNotification(alert, flights);
      const lastTriggeredAt = new Date().toISOString();
      await firestoreRequest(`users/${alert.userId}/alerts/${alert.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          fields: toFirestoreFields({ ...alert, lastTriggeredAt, updatedAt: lastTriggeredAt }),
        }),
      });
      checked.push({ alertId: alert.id, matches: flights.length, provider });
    }

    return NextResponse.json({ checked });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected alert check error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function toAlert(document: FirestoreDocument) {
  return {
    id: document.name.split("/").pop() ?? document.name,
    ...fromFirestoreFields(document.fields),
  } as FlightAlert;
}
