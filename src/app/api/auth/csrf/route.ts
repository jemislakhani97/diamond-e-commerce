import { NextResponse } from "next/server";
import {
  CSRF_COOKIE_NAME,
  CSRF_TTL_SECONDS,
  generateCsrfToken,
} from "@/lib/auth/csrf";

/**
 * GET /api/auth/csrf
 *
 * Mints a fresh CSRF token, sets it as an HttpOnly `csrf_token` cookie, and
 * returns the raw token in the JSON body so the sign-in form can embed it in
 * a hidden field. The `POST /api/auth` handler then compares the cookie
 * against the form field.
 */
export async function GET() {
  const token = generateCsrfToken();
  const response = NextResponse.json({ token });
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CSRF_TTL_SECONDS,
  });
  return response;
}
