// Server-only auth helpers for the Protectora area. A single demo account,
// credentials from env, and an HMAC-signed session cookie — no database, no
// external identity provider, no password in the cookie. Relies on
// node:crypto, so it can only run in the proxy or a route handler, never in
// a client bundle (same convention as lib/adoptante/*.ts).
import { createHmac, timingSafeEqual } from "node:crypto";

export const PROTECTORA_SESSION_COOKIE = "protectora_session";
export const PROTECTORA_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const PROTECTORA_LOGIN_PATH = "/protectora/login";
export const PROTECTORA_DEFAULT_PATH = "/protectora";

export type ProtectoraSession = { email: string; exp: number };

function getSessionSecret(): string {
  const secret = process.env.PROTECTORA_SESSION_SECRET;
  if (!secret) throw new Error("PROTECTORA_SESSION_SECRET no está configurada.");
  return secret;
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

/** Validates the submitted email/password against the single demo account. Server-side only. */
export function validateProtectoraCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.PROTECTORA_DEMO_EMAIL;
  const expectedPassword = process.env.PROTECTORA_DEMO_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;

  const emailMatches = timingSafeStringEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase());
  const passwordMatches = timingSafeStringEqual(password, expectedPassword);
  return emailMatches && passwordMatches;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", getSessionSecret()).update(payloadB64).digest("base64url");
}

/** Builds a signed session token (HMAC-SHA256) for the given email. Contains no password. */
export function createProtectoraSessionToken(email: string): string {
  const payload: ProtectoraSession = {
    email,
    exp: Math.floor(Date.now() / 1000) + PROTECTORA_SESSION_MAX_AGE_SECONDS,
  };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  return `${payloadB64}.${sign(payloadB64)}`;
}

/** Verifies a session token's signature and expiry. Returns the session or null. */
export function verifyProtectoraSessionToken(token: string | undefined | null): ProtectoraSession | null {
  if (!token) return null;
  const separatorIndex = token.indexOf(".");
  if (separatorIndex <= 0) return null;

  const payloadB64 = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  if (!payloadB64 || !signature) return null;

  let expectedSignature: string;
  try {
    expectedSignature = sign(payloadB64);
  } catch {
    return null;
  }
  if (!timingSafeStringEqual(signature, expectedSignature)) return null;

  let session: ProtectoraSession;
  try {
    const parsed = JSON.parse(base64UrlDecode(payloadB64)) as Partial<ProtectoraSession>;
    if (typeof parsed.email !== "string" || typeof parsed.exp !== "number") return null;
    session = { email: parsed.email, exp: parsed.exp };
  } catch {
    return null;
  }

  if (session.exp <= Math.floor(Date.now() / 1000)) return null;
  return session;
}

/**
 * Restricts a post-login redirect target to internal Protectora paths only.
 * Rejects protocol-relative ("//host/..."), absolute ("https://..."), and
 * any path outside /protectora — preventing open redirects via `next`.
 */
export function sanitizeProtectoraNextPath(raw: string | null | undefined): string {
  if (!raw) return PROTECTORA_DEFAULT_PATH;
  if (!raw.startsWith("/protectora")) return PROTECTORA_DEFAULT_PATH;
  if (raw.startsWith("//")) return PROTECTORA_DEFAULT_PATH;
  if (raw.includes("://")) return PROTECTORA_DEFAULT_PATH;
  if (raw.startsWith(PROTECTORA_LOGIN_PATH)) return PROTECTORA_DEFAULT_PATH;
  return raw;
}
