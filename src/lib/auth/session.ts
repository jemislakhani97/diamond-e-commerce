import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Session token signing.
 *
 * Pre-launch: a single HMAC-SHA256-signed cookie value of shape
 * `<base64url(email.expiryUnix)>.<base64url(hmac)>`.
 * Cookie is HttpOnly, Secure in production, SameSite=Lax. Never expose the raw
 * SESSION_SECRET or the signing input to any log line. When the real user DB
 * lands, swap `signSession` to embed a user id + rotate secret via env.
 */

export const SESSION_COOKIE_NAME = "session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Dev fallback is intentionally recognisable. Set SESSION_SECRET in every
// non-dev environment; a warning would print in dev but we do NOT log the
// secret itself. Production readers should refuse to boot without it (added
// once we wire a real config layer).
const SECRET =
  process.env.SESSION_SECRET ??
  "dev-only-session-secret-do-not-use-in-production";

export interface SessionPayload {
  email: string;
  expiryUnix: number;
}

export function signSession(email: string, expiryUnix: number): string {
  const payload = `${email}.${expiryUnix}`;
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const hmac = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payloadB64}.${hmac}`;
}

export function verifySession(token: string): SessionPayload | null {
  if (typeof token !== "string" || token === "") return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = token.slice(0, dot);
  const givenHmac = token.slice(dot + 1);

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expectedHmac = createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(givenHmac);
  const b = Buffer.from(expectedHmac);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const sep = payload.lastIndexOf(".");
  if (sep <= 0) return null;
  const email = payload.slice(0, sep);
  const expiryUnix = Number(payload.slice(sep + 1));
  if (!email || !Number.isFinite(expiryUnix)) return null;
  if (Math.floor(Date.now() / 1000) > expiryUnix) return null;
  return { email, expiryUnix };
}
