import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { firestoreRequest, requireFirebaseUser, toFirestoreFields } from "@/lib/server/firebaseRest";

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

    return NextResponse.json({
      url: `https://t.me/${botUsername.replace(/^@/, "")}?start=${token}`,
      expiresAt,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create Telegram link" },
      { status: 500 },
    );
  }
}
