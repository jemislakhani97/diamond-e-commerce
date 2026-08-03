import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "../route";
import { GET as CSRF_GET } from "../csrf/route";
import { CSRF_COOKIE_NAME, generateCsrfToken } from "@/lib/auth/csrf";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import {
  _FIXTURE_EMAIL,
  _FIXTURE_PASSWORD,
} from "@/lib/auth/fixtures";
import { _resetAllRateLimits } from "@/lib/auth/rateLimit";

type Fields = Record<string, string>;

function makePost(
  fields: Fields,
  opts: {
    csrfCookie?: string;
    ip?: string;
    malformed?: boolean;
    contentType?: string;
  } = {},
): Request {
  const contentType =
    opts.contentType ?? "application/x-www-form-urlencoded";
  const headers: Record<string, string> = {
    "content-type": contentType,
    "x-forwarded-for": opts.ip ?? "203.0.113.10",
  };
  if (opts.csrfCookie !== undefined) {
    headers.cookie = `${CSRF_COOKIE_NAME}=${opts.csrfCookie}`;
  }
  const body = opts.malformed
    ? "{not-json"
    : contentType.includes("json")
      ? JSON.stringify(fields)
      : new URLSearchParams(fields).toString();
  return new Request("http://localhost/api/auth", {
    method: "POST",
    headers,
    body,
  });
}

function goodSubmission(overrides: Partial<Fields> = {}, csrf = "csrf-token-value"): Fields {
  return {
    email: _FIXTURE_EMAIL,
    password: _FIXTURE_PASSWORD,
    csrf_token: csrf,
    ...overrides,
  };
}

describe("POST /api/auth — sign-in handler", () => {
  beforeEach(() => {
    _resetAllRateLimits();
  });

  it("returns 303 redirect to / with HttpOnly session cookie on valid credentials", async () => {
    const csrf = generateCsrfToken();
    const res = await POST(
      makePost(goodSubmission({}, csrf), { csrfCookie: csrf }),
    );
    expect(res.status).toBe(303);
    const loc = res.headers.get("location");
    expect(loc).toBeTruthy();
    expect(new URL(loc!).pathname).toBe("/");
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookie.toLowerCase()).toContain("httponly");
    expect(setCookie.toLowerCase()).toContain("samesite=lax");
    expect(setCookie.toLowerCase()).toContain("path=/");
  });

  it("returns 401 with a single generic message on invalid credentials — no field hint", async () => {
    const csrf = generateCsrfToken();
    const res = await POST(
      makePost(
        goodSubmission({ password: "not-the-right-password" }, csrf),
        { csrfCookie: csrf },
      ),
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe("Email or password is incorrect.");
    // The message must NOT reveal WHICH field was wrong.
    expect(body.message).not.toMatch(/no such (user|email)/i);
    expect(body.message).not.toMatch(/wrong password/i);
    expect(body.message).not.toMatch(/user not found/i);
  });

  it("returns 401 (not 404) when the email is unknown — no account enumeration", async () => {
    const csrf = generateCsrfToken();
    const res = await POST(
      makePost(
        goodSubmission(
          { email: "nobody@nowhere.example", password: "whatever-1234" },
          csrf,
        ),
        { csrfCookie: csrf },
      ),
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe("Email or password is incorrect.");
  });

  it("returns 403 when the CSRF cookie is missing", async () => {
    const res = await POST(
      makePost(goodSubmission({}, "any-form-token")),
    );
    expect(res.status).toBe(403);
  });

  it("returns 403 when the CSRF form field is missing (does NOT check credentials)", async () => {
    const csrf = generateCsrfToken();
    const fields = goodSubmission({}, csrf);
    delete fields.csrf_token;
    const res = await POST(makePost(fields, { csrfCookie: csrf }));
    expect(res.status).toBe(403);
  });

  it("returns 403 when the CSRF cookie and form field do not match", async () => {
    const csrf = generateCsrfToken();
    const different = generateCsrfToken();
    const res = await POST(
      makePost(goodSubmission({}, different), { csrfCookie: csrf }),
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 on empty email before touching the credential store", async () => {
    const csrf = generateCsrfToken();
    const res = await POST(
      makePost(goodSubmission({ email: "" }, csrf), { csrfCookie: csrf }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 on empty password before touching the credential store", async () => {
    const csrf = generateCsrfToken();
    const res = await POST(
      makePost(goodSubmission({ password: "" }, csrf), { csrfCookie: csrf }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 on malformed JSON body", async () => {
    const csrf = generateCsrfToken();
    const res = await POST(
      makePost(goodSubmission({}, csrf), {
        csrfCookie: csrf,
        malformed: true,
        contentType: "application/json",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 429 on the 6th failed attempt from the same IP within 15m", async () => {
    const csrf = generateCsrfToken();
    const ip = "198.51.100.42";
    const bad = () =>
      POST(
        makePost(
          goodSubmission({ password: "still-wrong" }, csrf),
          { csrfCookie: csrf, ip },
        ),
      );
    for (let i = 0; i < 5; i++) {
      const r = await bad();
      expect(r.status).toBe(401);
    }
    const sixth = await bad();
    expect(sixth.status).toBe(429);
  });

  it("does NOT rate-limit a different IP that is under the threshold", async () => {
    const csrf = generateCsrfToken();
    const bad = (ip: string) =>
      POST(
        makePost(
          goodSubmission({ password: "wrong-here" }, csrf),
          { csrfCookie: csrf, ip },
        ),
      );
    for (let i = 0; i < 5; i++) {
      const r = await bad("192.0.2.1");
      expect(r.status).toBe(401);
    }
    // Different IP: still allowed on its first attempt.
    const other = await bad("192.0.2.2");
    expect(other.status).toBe(401);
  });

  it("accepts JSON body too (parity with form-encoded submissions)", async () => {
    const csrf = generateCsrfToken();
    const res = await POST(
      makePost(goodSubmission({}, csrf), {
        csrfCookie: csrf,
        contentType: "application/json",
      }),
    );
    expect(res.status).toBe(303);
  });

  it("never logs the password (grep contract: no `console.log` in route.ts)", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const source = fs.readFileSync(
      path.resolve(__dirname, "..", "route.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/console\.log/);
  });
});

describe("GET /api/auth/csrf", () => {
  it("returns a token in the body and sets it as an HttpOnly csrf_token cookie", async () => {
    const res = await CSRF_GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(20);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${CSRF_COOKIE_NAME}=`);
    expect(setCookie.toLowerCase()).toContain("httponly");
  });
});
