// Guards the Protectora area only. Adoptante and Home remain fully public —
// this file's matcher never touches those routes. Runs server-side (Next.js
// Proxy defaults to the Node.js runtime), before the route is rendered, so
// protected pages never even start rendering for an unauthenticated visitor.
import { NextResponse, type NextRequest } from "next/server";
import {
  PROTECTORA_DEFAULT_PATH,
  PROTECTORA_LOGIN_PATH,
  PROTECTORA_SESSION_COOKIE,
  verifyProtectoraSessionToken,
} from "@/lib/protectora/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(PROTECTORA_SESSION_COOKIE)?.value;
  const session = verifyProtectoraSessionToken(token);

  if (pathname === PROTECTORA_LOGIN_PATH) {
    // Already-authenticated visitors don't need the login form again.
    if (session) return NextResponse.redirect(new URL(PROTECTORA_DEFAULT_PATH, request.url));
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL(PROTECTORA_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/protectora", "/protectora/:path*"],
};
