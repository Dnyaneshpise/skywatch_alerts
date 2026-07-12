import { NextResponse } from "next/server";
import { getBearerToken, requireFirebaseUser, firestoreRequest, fromFirestoreFields, toFirestoreFields, documentId, type FirestoreDocument } from "@/lib/server/firebaseRest";
import { normalizeAlertInput } from "@/lib/server/alerts";
import type { FlightAlert } from "@/types/alert";

export async function GET(request: Request) {
  try {
    const user = await requireFirebaseUser(request);
    const token = getBearerToken(request);
    const data = await firestoreRequest<{ documents?: FirestoreDocument[] }>(
      `users/${user.localId}/alerts`,
      {},
      token ?? undefined,
    );

    const alerts = (data.documents ?? []).map(toAlert);
    return NextResponse.json({ alerts });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireFirebaseUser(request);
    const token = getBearerToken(request);
    const input = normalizeAlertInput(await request.json(), user.localId);
    const now = new Date().toISOString();
    const document = await firestoreRequest<FirestoreDocument>(
      `users/${user.localId}/alerts`,
      {
        method: "POST",
        body: JSON.stringify({
          fields: toFirestoreFields({ ...input, createdAt: now }),
        }),
      },
      token ?? undefined,
    );

    return NextResponse.json({ alert: toAlert(document) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

function toAlert(document: FirestoreDocument) {
  return {
    id: documentId(document.name),
    ...fromFirestoreFields(document.fields),
  } as FlightAlert;
}

function handleError(error: unknown) {
  if (error instanceof Response) return error;
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = message.includes("required") || message.includes("Invalid") || message.includes("must be") ? 400 : 500;
  return NextResponse.json({ error: message }, { status });
}
