import { describe, expect, it } from "vitest";
import { matchListingImageToReport } from "../imageMatch";
import type { CertReport } from "../types";

const REPORT: CertReport = {
  certNumber: "1234567890",
  lab: "GIA",
  shape: "Round",
  carat: 1.02,
  color: "D",
  clarity: "VVS1",
  cutGrade: "Excellent",
  dimensionsMm: { length: 6.48, width: 6.5, depth: 3.99 },
};

describe("matchListingImageToReport", () => {
  it("returns match for dimensions well within tolerance", () => {
    const r = matchListingImageToReport(
      { lengthMm: 6.48, widthMm: 6.5, depthMm: 3.99 },
      REPORT,
    );
    expect(r.outcome).toBe("match");
    expect(r.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("returns mismatch when a dimension drifts past tolerance", () => {
    // 20% off on depth blows the 4% tolerance.
    const r = matchListingImageToReport(
      { lengthMm: 6.48, widthMm: 6.5, depthMm: 4.8 },
      REPORT,
    );
    expect(r.outcome).toBe("mismatch");
    expect(r.confidence).toBe(0);
  });

  it("returns pending (not mismatch) when image dimensions are missing", () => {
    const r = matchListingImageToReport({}, REPORT);
    expect(r.outcome).toBe("pending");
    expect(r.confidence).toBe(0);
    expect(r.reason).toMatch(/unavailable/i);
  });

  it("returns pending when only some dimensions are present", () => {
    const r = matchListingImageToReport({ lengthMm: 6.48 }, REPORT);
    expect(r.outcome).toBe("pending");
  });

  it("confidence degrades smoothly toward the tolerance boundary", () => {
    const close = matchListingImageToReport(
      { lengthMm: 6.5, widthMm: 6.5, depthMm: 3.99 },
      REPORT,
    );
    const farther = matchListingImageToReport(
      { lengthMm: 6.6, widthMm: 6.5, depthMm: 3.99 },
      REPORT,
    );
    expect(close.confidence).toBeGreaterThan(farther.confidence);
  });
});
