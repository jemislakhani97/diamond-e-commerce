import { describe, expect, it } from "vitest";
import { lookupCert } from "../lookup";

describe("lookupCert", () => {
  it("returns verified + report for a known GIA fixture", async () => {
    const r = await lookupCert("1234567890");
    expect(r.status).toBe("verified");
    expect(r.report?.lab).toBe("GIA");
    expect(r.report?.certNumber).toBe("1234567890");
    expect(r.report?.carat).toBeGreaterThan(0);
  });

  it("returns verified + report for a known AGS fixture", async () => {
    const r = await lookupCert("AGS10420193");
    expect(r.status).toBe("verified");
    expect(r.report?.lab).toBe("AGS");
  });

  it("returns not_found for an unknown but well-formed cert number", async () => {
    const r = await lookupCert("9999999999");
    expect(r.status).toBe("not_found");
    expect(r.report).toBeUndefined();
    expect(r.message).toMatch(/no gia\/ags|no gia/i);
  });

  it("returns not_found for a malformed cert number (never verified)", async () => {
    const r = await lookupCert("nope");
    expect(r.status).toBe("not_found");
    // Critical: never accidentally auto-verify a bad number.
    expect(r.report).toBeUndefined();
  });

  it("returns not_found on empty input", async () => {
    const r = await lookupCert("");
    expect(r.status).toBe("not_found");
  });

  it("normalizes whitespace/case before lookup", async () => {
    const r = await lookupCert(" ags-10420193 ");
    expect(r.status).toBe("verified");
    expect(r.report?.lab).toBe("AGS");
  });
});
