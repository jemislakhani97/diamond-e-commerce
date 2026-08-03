import { randomBytes, timingSafeEqual } from "node:crypto";

/**
 * CSRF protection — synchronizer token pattern.
 *
 * Flow:
 *   1. `GET /api/auth/csrf` mints a fresh token, sets it as an HttpOnly
 *      `csrf_token` cookie, and returns the raw token in the JSON body.
 *   2. The sign-in form embeds that token in a hidden `csrf_token` field.
 *   3. `POST /api/auth` compares the cookie value against the form field with
 *      a constant-time comparison and rejects with 403 on any mismatch or
 *      missing side.
 *
 * The cookie is HttpOnly so a stolen-script attacker cannot read it; the form
 * field is required so an attacker on another origin cannot forge a submit
 * (their forged POST would carry the victim's cookie but not the form token).
 */

export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_FIELD_NAME = "csrf_token";
export const CSRF_TTL_SECONDS = 60 * 60; // 1h

export function generateCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function csrfTokensMatch(cookieValue: string, formValue: string): boolean {
  if (
    typeof cookieValue !== "string" ||
    typeof formValue !== "string" ||
    cookieValue === "" ||
    formValue === ""
  ) {
    return false;
  }
  const a = Buffer.from(cookieValue);
  const b = Buffer.from(formValue);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
