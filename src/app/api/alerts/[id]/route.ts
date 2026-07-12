import { NextResponse } from "next/server";
import { getBearerToken, requireFirebaseUser, firestoreRequest, fromFirestoreFields, toFirestoreFields, documentId, type FirestoreDocument } from "@/lib/server/firebaseRest";
import { normalizeAlertInput } from "@/lib/server/alerts";
import type { FlightAlert } from "@/types/alert";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireFirebaseUser(request);
    const token = getBearerToken(request);
    const input = normalizeAlertInput(await request.json(), user.localId);
    const document = await firestoreRequest<FirestoreDocument>(
      `users/${user.localId}/alerts/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ fields: toFirestoreFields(input) }),
      },
      token ?? undefined,
    );

    return NextResponse.json({ alert: toAlert(document) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireFirebaseUser(request);
    const token = getBearerToken(request);

    await firestoreRequest(
      `users/${user.localId}/alerts/${id}`,
      { method: "DELETE" },
      token ?? undefined,
    );

    return NextResponse.json({ ok: true });
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
