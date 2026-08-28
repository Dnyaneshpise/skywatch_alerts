import type { FlightAlert } from "@/types/alert";
import { firestoreRequest, fromFirestoreFields, type FirestoreDocument } from "@/lib/server/firebaseRest";

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
  const sentProviders: string[] = [];

  const telegramChatId = await getTelegramChatId(alert);

  if (process.env.TELEGRAM_BOT_TOKEN && telegramChatId) {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: `${subject}\n\n${text}`,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram failed: ${await response.text()}`);
    }

    sentProviders.push("telegram");
  }

  if (process.env.RESEND_API_KEY && process.env.ALERT_FROM_EMAIL && alert.email) {
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

    sentProviders.push("resend");
  }

  if (sentProviders.length > 0) return sentProviders.join(",");

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

  throw new Error("Configure TELEGRAM_BOT_TOKEN, RESEND_API_KEY + ALERT_FROM_EMAIL, or ALERT_WEBHOOK_URL to send real alerts");
}

async function getTelegramChatId(alert: FlightAlert) {
  if (alert.telegramChatId) return alert.telegramChatId;

  try {
    const document = await firestoreRequest<FirestoreDocument>(`users/${alert.userId}/integrations/telegram`);
    const data = fromFirestoreFields(document.fields);
    return typeof data.chatId === "string" ? data.chatId : "";
  } catch {
    return "";
  }
}
