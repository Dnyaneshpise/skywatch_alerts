import { NextResponse } from "next/server";
import { firestoreRequest, getBearerToken, requireFirebaseUser, toFirestoreFields } from "@/lib/server/firebaseRest";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message, topic } = body;

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 },
      );
    }

    let userId = "anonymous";
    let token = getBearerToken(req) ?? undefined;

    if (token) {
      const user = await requireFirebaseUser(req);
      userId = user.localId;
    }

    const createdAt = new Date().toISOString();
    await firestoreRequest(
      "feedback",
      {
        method: "POST",
        body: JSON.stringify({
          fields: toFirestoreFields({
            name: String(name ?? ""),
            email: String(email),
            subject: String(subject ?? "Feedback"),
            topic: String(topic ?? "general"),
            message: String(message),
            userId,
            createdAt,
          }),
        }),
      },
      token,
    );

    return NextResponse.json({ message: "Feedback received!" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to store feedback";
    const status = message.includes("FIREBASE_SERVICE_ACCOUNT") ? 503 : 500;
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}
