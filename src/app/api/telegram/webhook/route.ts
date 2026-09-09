import { NextResponse } from "next/server";
import {
  firestoreRequest,
  fromFirestoreFields,
  toFirestoreFields,
  type FirestoreDocument,
} from "@/lib/server/firebaseRest";

export const runtime = "nodejs";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat?: {
      id?: number | string;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    from?: {
      username?: string;
      first_name?: string;
      last_name?: string;
    };
  };
};

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (
    secret &&
    request.headers.get("x-telegram-bot-api-secret-token") !== secret
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const update = (await request.json()) as TelegramUpdate;
    const text = update.message?.text ?? "";
    const chatId = update.message?.chat?.id;
    const token = text.match(/^\/start(?:\s+|$)(.*)$/)?.[1]?.trim();

    if (!chatId) {
      return NextResponse.json({ ok: true });
    }

    if (!token) {
      await sendTelegramMessage(
        String(chatId),
        "Please create a new Telegram connection link from the SkyWatch Alerts page, then press Start again.",
      );
      return NextResponse.json({ ok: true });
    }

    let linkDocument: FirestoreDocument;
    try {
      linkDocument = await firestoreRequest<FirestoreDocument>(
        `telegramLinks/${token}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("NOT_FOUND") || message.includes('"code": 404')) {
        await sendTelegramMessage(
          String(chatId),
          "This SkyWatch link was already used or has expired. Please create a new link from the Alerts page.",
        );
        return NextResponse.json({ ok: true });
      }
      throw error;
    }
    const link = fromFirestoreFields(linkDocument.fields);
    const userId = String(link.userId ?? "");
    const expiresAt = String(link.expiresAt ?? "");

    if (!userId || !expiresAt || Date.parse(expiresAt) < Date.now()) {
      await sendTelegramMessage(
        String(chatId),
        "This SkyWatch Telegram link expired. Please create a new link from the Alerts page.",
      );
      return NextResponse.json({ ok: true });
    }

    const username =
      update.message.from?.username || update.message.chat?.username || "";
    const displayName = [
      update.message.from?.first_name,
      update.message.from?.last_name,
    ]
      .filter(Boolean)
      .join(" ");
    const connectedAt = new Date().toISOString();

    await firestoreRequest(`users/${userId}/integrations/telegram`, {
      method: "PATCH",
      body: JSON.stringify({
        fields: toFirestoreFields({
          chatId: String(chatId),
          username,
          displayName,
          connectedAt,
        }),
      }),
    });

    await firestoreRequest(`telegramLinks/${token}`, { method: "DELETE" });
    await sendTelegramMessage(
      String(chatId),
      "SkyWatch Telegram alerts are connected. You can return to the Alerts page.",
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function sendTelegramMessage(chatId: string, text: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;

  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    },
  );
}
