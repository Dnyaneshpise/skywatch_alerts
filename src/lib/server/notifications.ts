import type { FlightAlert } from "@/types/alert";

type MatchedFlight = {
  flight?: string;
  callsign?: string;
  type?: string;
  lat: number;
  lon: number;
};

export async function sendAlertNotification(alert: FlightAlert, flights: MatchedFlight[]) {
  const subject = `SkyWatch alert: ${flights.length} aircraft within ${alert.distance} km`;
  const text = [
    `${alert.name} matched ${flights.length} aircraft near ${alert.lat}, ${alert.lon}.`,
    `Alert type: ${alert.type}`,
    `Radius: ${alert.distance} km`,
    "",
    ...flights.slice(0, 10).map((flight) => {
      const ident = flight.flight || flight.callsign || "Unknown aircraft";
      return `- ${ident} at ${flight.lat}, ${flight.lon}${flight.type ? ` (${flight.type})` : ""}`;
    }),
  ].join("\n");

  if (process.env.RESEND_API_KEY && process.env.ALERT_FROM_EMAIL) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.ALERT_FROM_EMAIL,
        to: alert.email,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend failed: ${await response.text()}`);
    }

    return "resend";
  }

  if (process.env.ALERT_WEBHOOK_URL) {
    const response = await fetch(process.env.ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert, flights, subject, text }),
    });

    if (!response.ok) {
      throw new Error(`Alert webhook failed: ${await response.text()}`);
    }

    return "webhook";
  }

  throw new Error("Configure RESEND_API_KEY + ALERT_FROM_EMAIL or ALERT_WEBHOOK_URL to send real alerts");
}
