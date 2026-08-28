import { NextResponse } from "next/server";
import { fromFirestoreFields, firestoreRequest, requireFirebaseUser, type FirestoreDocument } from "@/lib/server/firebaseRest";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireFirebaseUser(request);

    try {
      const document = await firestoreRequest<FirestoreDocument>(`users/${user.localId}/integrations/telegram`);
      const data = fromFirestoreFields(document.fields);

      return NextResponse.json({
        connected: Boolean(data.chatId),
        chatId: data.chatId ?? "",
        username: data.username ?? "",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("NOT_FOUND") || message.includes("404")) {
        return NextResponse.json({ connected: false });
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load Telegram status" },
      { status: 500 },
    );
  }
}
