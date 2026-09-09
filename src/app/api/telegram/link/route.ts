import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  firestoreRequest,
  requireFirebaseUser,
  toFirestoreFields,
} from "@/lib/server/firebaseRest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireFirebaseUser(request);
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;

    if (!botUsername) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_USERNAME is not configured" },
        { status: 503 },
      );
    }

    const token = randomBytes(18).toString("base64url");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    await firestoreRequest(`telegramLinks/${token}`, {
      method: "PATCH",
      body: JSON.stringify({
        fields: toFirestoreFields({
          userId: user.localId,
          email: user.email ?? "",
          createdAt: now.toISOString(),
          expiresAt,
        }),
      }),
    });

    const webhookUrl = getWebhookUrl(request);
    if (!webhookUrl) {
      return NextResponse.json(
        {
          error:
            "Telegram needs a public HTTPS app URL. Use a deployed app or start a public tunnel for local development.",
        },
        { status: 503 },
      );
    }

    await registerTelegramWebhook(webhookUrl);

    const username = botUsername.replace(/^@/, "");

    return NextResponse.json({
      url: `https://t.me/${username}?start=${token}`,
      appUrl: `tg://resolve?domain=${username}&start=${token}`,
      webUrl: `https://web.telegram.org/k/#@${username}?start=${token}`,
      expiresAt,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create Telegram link",
      },
      { status: 500 },
    );
  }
}

function getWebhookUrl(request: Request) {
  const configuredUrl = process.env.TELEGRAM_WEBHOOK_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const requestUrl = new URL(request.url);
  if (
    requestUrl.hostname === "localhost" ||
    requestUrl.hostname === "127.0.0.1"
  ) {
    return "";
  }

  return `${requestUrl.origin}/api/telegram/webhook`;
}

async function registerTelegramWebhook(webhookUrl: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        ...(process.env.TELEGRAM_WEBHOOK_SECRET
          ? { secret_token: process.env.TELEGRAM_WEBHOOK_SECRET }
          : {}),
      }),
    },
  );
  const data = (await response.json()) as {
    ok?: boolean;
    description?: string;
  };

  if (!response.ok || !data.ok) {
    throw new Error(data.description || "Telegram webhook registration failed");
  }
}
