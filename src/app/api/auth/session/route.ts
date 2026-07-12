import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/server/firebaseRest";

export async function POST(request: Request) {
  const { idToken } = (await request.json()) as { idToken?: string };

  if (!idToken) {
    return NextResponse.json({ error: "idToken is required" }, { status: 400 });
  }

  await verifyFirebaseIdToken(idToken);

  const response = NextResponse.json({ ok: true });
  response.cookies.set("skywatch_session", idToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 55 * 60,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("skywatch_session");
  return response;
}
