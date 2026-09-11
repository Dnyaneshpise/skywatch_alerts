import { NextResponse } from "next/server";
import {
  firestoreRequest,
  getBearerToken,
  requireFirebaseUser,
  toFirestoreFields,
  fromFirestoreFields,
  type FirestoreDocument,
} from "@/lib/server/firebaseRest";
import { sendAlertNotification } from "@/lib/server/notifications";

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

    // Send thank you notification
    try {
      if (userId !== "anonymous") {
        // Get user's notification preferences
        const userDoc = (await firestoreRequest(
          `users/${userId}`,
          { method: "GET" },
          token,
        )) as FirestoreDocument;

        const userData = fromFirestoreFields(userDoc.fields);
        const telegramChatId = userData?.telegramChatId || "";

        // Send email notification
        if (email) {
          await sendAlertNotification({
            email,
            telegramChatId: "",
            title: "Thank you for contacting SkyWatch Alerts!",
            message: `Hi ${name || "there"}!\n\nWe received your feedback regarding "${subject}" and appreciate you reaching out. Our team will review your message and get back to you shortly.\n\nThank you for using SkyWatch Alerts! 🛩️`,
          });
        }

        // Send telegram notification
        if (telegramChatId) {
          await sendAlertNotification({
            email: "",
            telegramChatId,
            title: "Thank you for contacting SkyWatch Alerts!",
            message: `Hi ${name || "there"}!\n\nWe received your feedback regarding "${subject}" and appreciate you reaching out. Our team will review your message and get back to you shortly.\n\nThank you for using SkyWatch Alerts! 🛩️`,
          });
        }
      }
    } catch (notificationErr) {
      console.error("Failed to send thank you notification:", notificationErr);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      message: "Feedback received! Thank you for contacting us.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to store feedback";
    const status = message.includes("FIREBASE_SERVICE_ACCOUNT") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
