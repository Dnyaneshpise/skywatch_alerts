import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = ["/alerts", "/profile", "/Dashboard", "/feedback"];

export function middleware(request: NextRequest) {
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));
  if (!isProtectedPath) return NextResponse.next();

  const hasSession = request.cookies.has("skywatch_session");
  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/signin";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/alerts/:path*", "/profile/:path*", "/Dashboard/:path*", "/feedback/:path*"],
};
