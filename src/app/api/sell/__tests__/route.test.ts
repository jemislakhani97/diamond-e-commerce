import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "../route";
import { __configureForTests, __resetForTests } from "@/lib/sell/store";

function jsonPost(body: unknown, malformed = false): Request {
  return new Request("http://localhost/api/sell", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: malformed ? "not-json" : JSON.stringify(body),
  });
}

function formPost(fields: Record<string, string>): Request {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(fields)) params.append(k, v);
  return new Request("http://localhost/api/sell", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
}

describe("POST /api/sell — seller application handler", () => {
  beforeEach(() => {
    __resetForTests();
    __configureForTests({ file: null });
  });
  afterEach(() => {
    __resetForTests();
  });

  it("200 on a valid JSON body with all required fields (camelCase)", async () => {
    const res = await POST(
      jsonPost({
        businessName: "Vale Diamonds",
        contactName: "Jane Doe",
        email: "jane@vale.example",
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, message: "Application received" });
  });

  it("200 on a valid form-urlencoded body (snake_case per repo convention)", async () => {
    const res = await POST(
      formPost({
        business_name: "Vale Diamonds",
        contact_name: "Jane Doe",
        email: "jane@vale.example",
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("400 lists missing fields when businessName is absent", async () => {
    const res = await POST(
      jsonPost({ contactName: "Jane", email: "jane@vale.example" }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.missing).toContain("businessName");
  });

  it("400 lists every missing field when multiple are absent", async () => {
    const res = await POST(jsonPost({ email: "jane@vale.example" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.missing).toEqual(
      expect.arrayContaining(["businessName", "contactName"]),
    );
    expect(body.missing).not.toContain("email");
  });

  it("400 on missing email specifically", async () => {
    const res = await POST(
      jsonPost({ businessName: "Vale", contactName: "Jane" }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.missing).toContain("email");
  });

  it("400 on invalid email format (no @)", async () => {
    const res = await POST(
      jsonPost({
        businessName: "Vale",
        contactName: "Jane",
        email: "not-an-email",
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/email/i);
  });

  it("400 on invalid email format (missing dot in domain)", async () => {
    const res = await POST(
      jsonPost({
        businessName: "Vale",
        contactName: "Jane",
        email: "jane@localhost",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("400 on malformed JSON — does NOT throw or return 500", async () => {
    const res = await POST(jsonPost({}, /*malformed*/ true));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("400 on unknown content-type", async () => {
    const res = await POST(
      new Request("http://localhost/api/sell", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "raw body",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("400 when submitted values are whitespace-only (treated as missing)", async () => {
    const res = await POST(
      jsonPost({
        businessName: "   ",
        contactName: "Jane",
        email: "jane@vale.example",
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.missing).toContain("businessName");
  });

  it("409 on a duplicate email submitted within 24h", async () => {
    const first = await POST(
      jsonPost({
        businessName: "Vale",
        contactName: "Jane",
        email: "dupe@vale.example",
      }),
    );
    expect(first.status).toBe(200);

    const second = await POST(
      jsonPost({
        businessName: "Vale",
        contactName: "Jane",
        email: "dupe@vale.example",
      }),
    );
    expect(second.status).toBe(409);
    const body = await second.json();
    expect(body.success).toBe(false);
  });

  it("409 is email-scoped and case-insensitive (DUPE@… collides with dupe@…)", async () => {
    await POST(
      jsonPost({
        businessName: "Vale",
        contactName: "Jane",
        email: "dupe@vale.example",
      }),
    );
    const res = await POST(
      jsonPost({
        businessName: "Vale",
        contactName: "Jane",
        email: "DUPE@vale.example",
      }),
    );
    expect(res.status).toBe(409);
  });

  it("concurrent same-email POSTs — exactly one 200, one 409, no double-persist", async () => {
    const [a, b] = await Promise.all([
      POST(
        jsonPost({
          businessName: "Vale",
          contactName: "Jane",
          email: "race@vale.example",
        }),
      ),
      POST(
        jsonPost({
          businessName: "Vale",
          contactName: "Jane",
          email: "race@vale.example",
        }),
      ),
    ]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([200, 409]);
  });
});
