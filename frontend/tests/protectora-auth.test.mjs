import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  PROTECTORA_SESSION_COOKIE,
  createProtectoraSessionToken,
  sanitizeProtectoraNextPath,
  validateProtectoraCredentials,
  verifyProtectoraSessionToken,
} from "../src/lib/protectora/auth.ts";

// auth.ts reads process.env at call time (not at module load), so setting
// these here — before any assertion — is sufficient regardless of import
// order, and mirrors the real .env.local shape without touching it.
process.env.PROTECTORA_DEMO_EMAIL = "demo@invisibledogs.es";
process.env.PROTECTORA_DEMO_PASSWORD = "correct-horse-battery-staple";
process.env.PROTECTORA_SESSION_SECRET = "test-secret-only-used-in-this-suite";

const proxySource = await readFile(new URL("../src/proxy.ts", import.meta.url), "utf8");
const loginRouteSource = await readFile(new URL("../src/app/api/protectora/login/route.ts", import.meta.url), "utf8");
const logoutRouteSource = await readFile(new URL("../src/app/api/protectora/logout/route.ts", import.meta.url), "utf8");
const loginPageSource = await readFile(new URL("../src/app/protectora/login/page.tsx", import.meta.url), "utf8");
const loginFormSource = await readFile(new URL("../src/components/protectora/LoginForm.tsx", import.meta.url), "utf8");
const homePageSource = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");

// C: credenciales correctas -> sesión creada.
test("C: credenciales correctas validan y permiten crear una sesión verificable", () => {
  assert.equal(validateProtectoraCredentials("demo@invisibledogs.es", "correct-horse-battery-staple"), true);
  // Case-insensitive email, exact-case password (documented behaviour).
  assert.equal(validateProtectoraCredentials("DEMO@InvisibleDogs.ES", "correct-horse-battery-staple"), true);

  const token = createProtectoraSessionToken("demo@invisibledogs.es");
  const session = verifyProtectoraSessionToken(token);
  assert.ok(session);
  assert.equal(session.email, "demo@invisibledogs.es");
  assert.ok(session.exp > Math.floor(Date.now() / 1000));
});

// D: credenciales incorrectas -> rechazo genérico.
test("D: credenciales incorrectas (email o contraseña) se rechazan sin distinguir el motivo", () => {
  assert.equal(validateProtectoraCredentials("nadie@invisibledogs.es", "correct-horse-battery-staple"), false);
  assert.equal(validateProtectoraCredentials("demo@invisibledogs.es", "contraseña-equivocada"), false);
  assert.equal(validateProtectoraCredentials("", ""), false);

  // The route handler must return one fixed message regardless of which
  // check failed — never "usuario inexistente" vs "contraseña incorrecta".
  // Every `{ ok: false, message: ... }` response literal must reuse the
  // single GENERIC_ERROR_MESSAGE constant, never an inline distinct string.
  const errorResponseLiterals = [...loginRouteSource.matchAll(/ok:\s*false,\s*message:\s*(\w+)/g)].map((m) => m[1]);
  assert.ok(errorResponseLiterals.length >= 2, "debe haber al menos dos ramas de error (parseo inválido y credenciales inválidas)");
  assert.ok(errorResponseLiterals.every((name) => name === "GENERIC_ERROR_MESSAGE"));
  assert.match(loginRouteSource, /GENERIC_ERROR_MESSAGE = "Correo o contraseña incorrectos\."/);
});

test("credenciales rechazadas cuando faltan variables de entorno (fail closed)", () => {
  const originalEmail = process.env.PROTECTORA_DEMO_EMAIL;
  delete process.env.PROTECTORA_DEMO_EMAIL;
  try {
    assert.equal(validateProtectoraCredentials("demo@invisibledogs.es", "correct-horse-battery-staple"), false);
  } finally {
    process.env.PROTECTORA_DEMO_EMAIL = originalEmail;
  }
});

test("un token con la firma manipulada se rechaza", () => {
  const token = createProtectoraSessionToken("demo@invisibledogs.es");
  const [payload, signature] = token.split(".");
  const tamperedSignature = signature.slice(0, -1) + (signature.at(-1) === "a" ? "b" : "a");
  assert.equal(verifyProtectoraSessionToken(`${payload}.${tamperedSignature}`), null);
});

test("un token con el payload manipulado (email cambiado) se rechaza", () => {
  const token = createProtectoraSessionToken("demo@invisibledogs.es");
  const [, signature] = token.split(".");
  const forgedPayload = Buffer.from(JSON.stringify({ email: "atacante@example.com", exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
  assert.equal(verifyProtectoraSessionToken(`${forgedPayload}.${signature}`), null);
});

test("un token expirado se rechaza aunque la firma sea válida", () => {
  // Forge a token signed with the SAME secret the test controls
  // (PROTECTORA_SESSION_SECRET, set above) but with `exp` already in the
  // past — this isolates the expiry check from the signature check: the
  // signature is genuinely valid, only the expiry should cause rejection.
  const expiredPayloadB64 = Buffer.from(
    JSON.stringify({ email: "demo@invisibledogs.es", exp: Math.floor(Date.now() / 1000) - 10 }),
  ).toString("base64url");
  const validSignatureForExpiredPayload = createHmac("sha256", process.env.PROTECTORA_SESSION_SECRET)
    .update(expiredPayloadB64)
    .digest("base64url");
  const expiredButValidlySignedToken = `${expiredPayloadB64}.${validSignatureForExpiredPayload}`;

  assert.equal(verifyProtectoraSessionToken(expiredButValidlySignedToken), null);

  // Sanity: a freshly created token (same email, future exp) IS accepted,
  // proving the rejection above is specifically about expiry.
  assert.ok(verifyProtectoraSessionToken(createProtectoraSessionToken("demo@invisibledogs.es")));
});

test("un token vacío, ausente o mal formado se rechaza sin lanzar", () => {
  assert.equal(verifyProtectoraSessionToken(undefined), null);
  assert.equal(verifyProtectoraSessionToken(null), null);
  assert.equal(verifyProtectoraSessionToken(""), null);
  assert.equal(verifyProtectoraSessionToken("no-hay-punto-aqui"), null);
  assert.equal(verifyProtectoraSessionToken("."), null);
});

// J: next seguro interno funciona.
test("J: un next interno de Protectora se conserva", () => {
  assert.equal(sanitizeProtectoraNextPath("/protectora/perro/485bebd4f"), "/protectora/perro/485bebd4f");
  assert.equal(sanitizeProtectoraNextPath("/protectora"), "/protectora");
});

// K: next externo malicioso NO funciona.
test("K: un next externo o malicioso se descarta a favor de /protectora", () => {
  assert.equal(sanitizeProtectoraNextPath("https://evil.example.com/phish"), "/protectora");
  assert.equal(sanitizeProtectoraNextPath("//evil.example.com"), "/protectora");
  assert.equal(sanitizeProtectoraNextPath("http://evil.example.com"), "/protectora");
  assert.equal(sanitizeProtectoraNextPath("/adoptante/encontrar"), "/protectora");
  assert.equal(sanitizeProtectoraNextPath("javascript:alert(1)"), "/protectora");
  assert.equal(sanitizeProtectoraNextPath(null), "/protectora");
  assert.equal(sanitizeProtectoraNextPath(""), "/protectora");
  // Avoid redirecting back into the login page itself.
  assert.equal(sanitizeProtectoraNextPath("/protectora/login?next=/protectora"), "/protectora");
});

// A/B: rutas privadas sin sesión -> redirect a login. Verified structurally
// (proxy.ts cannot be imported here — this project's Node test runner
// cannot resolve "next/server" outside the Next.js build/dev process, the
// same reason the existing suite never imports Route Handlers directly).
// Real request/redirect behaviour is exercised against the live server as
// part of the manual smoke test (section 20 of the task).
test("A/B: el proxy redirige a /protectora/login cuando no hay sesión válida", () => {
  assert.match(proxySource, /if \(!session\)/);
  assert.match(proxySource, /PROTECTORA_LOGIN_PATH/);
  assert.match(proxySource, /NextResponse\.redirect\(loginUrl\)/);
  assert.match(proxySource, /loginUrl\.searchParams\.set\("next", pathname/);
});

// G/H: usuario autenticado puede abrir /protectora y la ficha.
test("G/H: con sesión válida el proxy deja pasar la petición (no redirige)", () => {
  assert.match(proxySource, /return NextResponse\.next\(\);/);
  // The only branches that produce a response are: login-while-authenticated
  // (redirect home) and no-session (redirect to login). Anything else falls
  // through to NextResponse.next().
});

// I: login estando autenticado -> redirect /protectora.
test("I: visitar /protectora/login ya autenticado redirige a /protectora", () => {
  assert.match(proxySource, /pathname === PROTECTORA_LOGIN_PATH/);
  assert.match(proxySource, /if \(session\) return NextResponse\.redirect\(new URL\(PROTECTORA_DEFAULT_PATH/);
});

// L/M: Adoptante y Home siguen públicos — the proxy's matcher must never
// reach outside /protectora.
test("L/M: el matcher del proxy solo cubre /protectora, nunca Adoptante ni Home", () => {
  const configMatch = proxySource.match(/export const config = \{([\s\S]*?)\};/);
  assert.ok(configMatch, "proxy.ts debe exportar config.matcher");
  const configBlock = configMatch[1];
  assert.doesNotMatch(configBlock, /adoptante/i);
  assert.match(configBlock, /"\/protectora"/);
  assert.match(configBlock, /"\/protectora\/:path\*"/);
});

// E: cookie httpOnly (+ sameSite=lax, secure en producción, path=/).
test("E: la cookie de sesión se crea httpOnly, sameSite=lax, path=/ y secure en producción", () => {
  assert.match(loginRouteSource, /httpOnly:\s*true/);
  assert.match(loginRouteSource, /sameSite:\s*"lax"/);
  assert.match(loginRouteSource, /path:\s*"\/"/);
  assert.match(loginRouteSource, /secure:\s*process\.env\.NODE_ENV === "production"/);
  // The cookie value must be the signed token, never email/password.
  assert.doesNotMatch(loginRouteSource, /cookies\(\)\)\.set\(PROTECTORA_SESSION_COOKIE,\s*password/);
  assert.match(loginRouteSource, new RegExp(`set\\(PROTECTORA_SESSION_COOKIE,\\s*token`));
});

test("la contraseña nunca se registra ni se filtra en el código del route handler", () => {
  assert.doesNotMatch(loginRouteSource, /console\.(log|error|warn)\([^)]*password/i);
});

// F: logout -> cookie invalidada.
test("F: el logout borra la cookie de sesión", () => {
  assert.match(logoutRouteSource, /cookies\(\)\)\.delete\(PROTECTORA_SESSION_COOKIE\)/);
});

test("PROTECTORA_SESSION_COOKIE tiene un nombre estable usado de forma consistente", () => {
  assert.equal(PROTECTORA_SESSION_COOKIE, "protectora_session");
  assert.match(loginRouteSource, /PROTECTORA_SESSION_COOKIE/);
  assert.match(logoutRouteSource, /PROTECTORA_SESSION_COOKIE/);
  assert.match(proxySource, /PROTECTORA_SESSION_COOKIE/);
});

// UI: estados idle/enviando/error, sin doble submit, sin exponer contraseña.
test("el formulario de login controla los estados de envío y evita doble submit", () => {
  assert.match(loginFormSource, /"use client"/);
  assert.match(loginFormSource, /status === "submitting"/);
  assert.match(loginFormSource, /if \(status === "submitting"\) return;/);
  assert.match(loginFormSource, /disabled=\{submitting\}/);
  assert.match(loginFormSource, /type="password"/);
  assert.doesNotMatch(loginFormSource, /type="text"[^>]*password/i);
});

test("el formulario nunca guarda credenciales en localStorage/sessionStorage", () => {
  assert.doesNotMatch(loginFormSource, /localStorage|sessionStorage/);
  assert.doesNotMatch(loginPageSource, /localStorage|sessionStorage/);
  assert.doesNotMatch(loginRouteSource, /localStorage|sessionStorage/);
});

test("el next se sanea server-side en la página de login antes de llegar al formulario", () => {
  assert.match(loginPageSource, /sanitizeProtectoraNextPath/);
});

// Home: "Soy una protectora" / el enlace del recorrido apuntan a /protectora/login, nunca directo a /protectora.
test("Home: los accesos de Protectora apuntan a /protectora/login, no a /protectora directamente", () => {
  const protectoraHrefs = [...homePageSource.matchAll(/href="(\/protectora[^"]*)"/g)].map((m) => m[1]);
  assert.ok(protectoraHrefs.length > 0, "Home debe enlazar a Protectora en algún punto");
  assert.ok(protectoraHrefs.every((href) => href === "/protectora/login"), `enlaces inesperados: ${protectoraHrefs.join(", ")}`);
});
