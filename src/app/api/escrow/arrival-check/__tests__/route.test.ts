import { describe, expect, it } from "vitest";
import { POST } from "../route";

function post(body: unknown, malformed = false): Request {
  return new Request("http://localhost/api/escrow/arrival-check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: malformed ? "not-json" : JSON.stringify(body),
  });
}

describe("POST /api/escrow/arrival-check — go/hold invariants", () => {
  it("returns go ONLY when cert is verified AND image matches", async () => {
    const res = await POST(
      post({
        bookingId: "bk_1",
        certNumber: "1234567890",
        imageMetadata: { lengthMm: 6.48, widthMm: 6.5, depthMm: 3.99 },
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("go");
    expect(body.verification).toBe("verified");
    expect(body.imageConfidence).toBeGreaterThanOrEqual(0.7);
  });

  it("holds when cert is not_found — never releases on unknown stone", async () => {
    const res = await POST(
      post({
        bookingId: "bk_2",
        certNumber: "9999999999",
        imageMetadata: { lengthMm: 6.48, widthMm: 6.5, depthMm: 3.99 },
      }),
    );
    const body = await res.json();
    expect(body.status).toBe("hold");
    expect(body.verification).toBe("not_found");
  });

  it("holds when image dimensions diverge past tolerance", async () => {
    const res = await POST(
      post({
        bookingId: "bk_3",
        certNumber: "1234567890",
        imageMetadata: { lengthMm: 6.48, widthMm: 6.5, depthMm: 4.8 },
      }),
    );
    const body = await res.json();
    expect(body.status).toBe("hold");
    expect(body.verification).toBe("mismatch");
  });

  it("holds (pending) when image metadata is unavailable — never releases on incomplete check", async () => {
    const res = await POST(
      post({ bookingId: "bk_4", certNumber: "1234567890" }),
    );
    const body = await res.json();
    expect(body.status).toBe("hold");
    expect(body.verification).toBe("pending");
    // Critical invariant: even on an image-metadata gap, funds MUST NOT release.
    expect(body.status).not.toBe("go");
  });

  it("holds when listing has no certNumber", async () => {
    const res = await POST(post({ bookingId: "bk_5" }));
    const body = await res.json();
    expect(body.status).toBe("hold");
    expect(body.reason).toMatch(/certificate number/i);
  });

  it("400 hold on missing bookingId", async () => {
    const res = await POST(post({ certNumber: "1234567890" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.status).toBe("hold");
  });

  it("400 hold on malformed JSON", async () => {
    const res = await POST(post({}, /*malformed*/ true));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.status).toBe("hold");
  });
});
