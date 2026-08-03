import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth/fixtures";
import {
  CSRF_COOKIE_NAME,
  CSRF_FIELD_NAME,
  csrfTokensMatch,
} from "@/lib/auth/csrf";
import {
  recordFailedAttempt,
  shouldRateLimit,
  clearAttempts,
} from "@/lib/auth/rateLimit";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  signSession,
} from "@/lib/auth/session";

/**
 * POST /api/auth
 *
 * Sign-in submission handler. Ordered checks:
 *   1. Parse form body (400 on malformed).
 *   2. CSRF: cookie + form field must match (403 on missing/mismatch) — done
 *      first so a CSRF-based POST can't exhaust rate-limit or trigger scrypt.
 *   3. Empty email/password (400 before any credential check).
 *   4. Rate limit: 5 failed attempts per IP per 15m (429 without processing).
 *   5. Credential check against fixture store (401 generic on invalid,
 *      counter incremented). On success: mint signed session cookie, clear
 *      the IP's counter, 303 redirect to `/`.
 *
 * NEVER log the password field or the raw cookie value.
 */

const GENERIC_INVALID = "Email or password is incorrect.";

function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff && xff.length > 0) {
    const first = xff.split(",")[0];
    if (first) {
      const trimmed = first.trim();
      if (trimmed) return trimmed;
    }
  }
  const real = request.headers.get("x-real-ip");
  if (real && real.trim() !== "") return real.trim();
  return "unknown";
}

function parseCookieHeader(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const pair of header.split(";")) {
    const eq = pair.indexOf("=");
    if (eq <= 0) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (!name) continue;
    try {
      out[name] = decodeURIComponent(value);
    } catch {
      out[name] = value;
    }
  }
  return out;
}

async function readSubmission(
  request: Request,
): Promise<Record<string, string> | null> {
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const json = (await request.json()) as unknown;
      if (!json || typeof json !== "object") return null;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
        if (typeof v === "string") out[k] = v;
      }
      return out;
    }
    const form = await request.formData();
    const out: Record<string, string> = {};
    form.forEach((value, key) => {
      if (typeof value === "string") out[key] = value;
    });
    return out;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const submission = await readSubmission(request);
  if (!submission) {
    return NextResponse.json(
      { status: "error", message: "Request body is not valid." },
      { status: 400 },
    );
  }

  // 1) CSRF FIRST — before any credential or timing-costly work.
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const csrfCookie = cookies[CSRF_COOKIE_NAME] ?? "";
  const csrfForm = submission[CSRF_FIELD_NAME] ?? "";
  if (!csrfTokensMatch(csrfCookie, csrfForm)) {
    return NextResponse.json(
      { status: "error", message: "Invalid or missing CSRF token." },
      { status: 403 },
    );
  }

  // 2) Empty-field guard. Runs BEFORE the credential check so we don't burn
  // scrypt on an empty submission (and matches the acceptance criterion).
  const email = (submission.email ?? "").trim();
  const password = submission.password ?? "";
  if (!email || !password) {
    return NextResponse.json(
      { status: "error", message: "Email and password are required." },
      { status: 400 },
    );
  }

  // 3) Rate limit — check EXISTING count first, before credential work.
  const ip = clientIp(request);
  if (shouldRateLimit(ip)) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Too many failed sign-in attempts. Please try again in a few minutes.",
      },
      { status: 429 },
    );
  }

  // 4) Credential check.
  const ok = verifyCredentials(email, password);
  if (!ok) {
    recordFailedAttempt(ip);
    return NextResponse.json(
      { status: "error", message: GENERIC_INVALID },
      { status: 401 },
    );
  }

  // 5) Success — clear the IP counter and mint a signed session cookie,
  // then 303-redirect to `/` so a browser form POST does the right thing.
  clearAttempts(ip);
  const expiryUnix =
    Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = signSession(email.toLowerCase(), expiryUnix);
  const location = new URL("/", request.url).toString();
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: location },
  });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}
