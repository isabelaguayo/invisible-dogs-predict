// Server-side credential check for the single Protectora demo account.
// Never trusts the client: email/password are validated here, the session
// cookie is signed here, and the post-login redirect target is re-sanitized
// here even though the login page already sanitized it once (defense in
// depth against a hand-crafted POST bypassing the UI).
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  PROTECTORA_SESSION_COOKIE,
  PROTECTORA_SESSION_MAX_AGE_SECONDS,
  createProtectoraSessionToken,
  sanitizeProtectoraNextPath,
  validateProtectoraCredentials,
} from "@/lib/protectora/auth";

export const runtime = "nodejs";

const GENERIC_ERROR_MESSAGE = "Correo o contraseña incorrectos.";

export type ProtectoraLoginResponse =
  | { ok: true; next: string }
  | { ok: false; message: string };

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown; next?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ProtectoraLoginResponse>({ ok: false, message: GENERIC_ERROR_MESSAGE }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const nextPath = sanitizeProtectoraNextPath(typeof body.next === "string" ? body.next : null);

  if (!email || !password || !validateProtectoraCredentials(email, password)) {
    // Same message regardless of which check failed — never reveal whether
    // the account exists.
    return NextResponse.json<ProtectoraLoginResponse>({ ok: false, message: GENERIC_ERROR_MESSAGE }, { status: 401 });
  }

  const token = createProtectoraSessionToken(email.trim().toLowerCase());
  (await cookies()).set(PROTECTORA_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PROTECTORA_SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json<ProtectoraLoginResponse>({ ok: true, next: nextPath });
}
