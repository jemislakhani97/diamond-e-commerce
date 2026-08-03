import type { CertReport } from "./types";

/**
 * Image-metadata cross-check against cert report dimensions.
 *
 * The listing image carries EXIF/metadata dimensions in millimeters (captured
 * from the loupe / imaging rig). We compare against the report dimensions and
 * return a 0-1 confidence score. Callers decide the pass threshold — the
 * arrival-check flow uses `>= 0.7` as the go/hold cutoff.
 *
 * If the image metadata is missing (undefined dimensions), we return a
 * `pending` result rather than failing outright — a listing without imaging
 * data should NOT auto-fail a verified stone.
 */

export interface ImageMetadata {
  // Dimensions in millimeters, captured at listing time. Any field may be
  // undefined if the loupe rig didn't record it.
  lengthMm?: number;
  widthMm?: number;
  depthMm?: number;
}

export type ImageMatchOutcome = "match" | "mismatch" | "pending";

export interface ImageMatchResult {
  outcome: ImageMatchOutcome;
  confidence: number; // 0-1, always populated
  reason: string;
}

// Max tolerated relative deviation per axis before we call it a mismatch.
// 4% is the tolerance printed on the AGS proportion analysis; GIA reports
// round to 0.01mm so real-world imaging error is typically well under this.
const MATCH_TOLERANCE = 0.04;

function relativeError(actual: number, expected: number): number {
  if (expected <= 0) return 1;
  return Math.abs(actual - expected) / expected;
}

export function matchListingImageToReport(
  image: ImageMetadata,
  report: CertReport,
): ImageMatchResult {
  const haveAll =
    typeof image.lengthMm === "number" &&
    typeof image.widthMm === "number" &&
    typeof image.depthMm === "number";

  if (!haveAll) {
    return {
      outcome: "pending",
      confidence: 0,
      reason: "Image dimensions unavailable — cannot compare against report.",
    };
  }

  const errors = [
    relativeError(image.lengthMm as number, report.dimensionsMm.length),
    relativeError(image.widthMm as number, report.dimensionsMm.width),
    relativeError(image.depthMm as number, report.dimensionsMm.depth),
  ];
  const worst = Math.max(...errors);
  // Confidence: 1.0 at zero error, 0.0 at tolerance. Clamped.
  const confidence = Math.max(0, Math.min(1, 1 - worst / MATCH_TOLERANCE));

  if (worst > MATCH_TOLERANCE) {
    return {
      outcome: "mismatch",
      confidence,
      reason: `Image dimensions diverge from report by ${(worst * 100).toFixed(1)}% (tolerance ${(MATCH_TOLERANCE * 100).toFixed(0)}%).`,
    };
  }

  return {
    outcome: "match",
    confidence,
    reason: `Image dimensions within ${(MATCH_TOLERANCE * 100).toFixed(0)}% of report.`,
  };
}
