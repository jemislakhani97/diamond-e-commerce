import type { CertLookupResponse, CertReport } from "./types";
import { detectCertLab, isValidCertNumber, normalizeCertNumber } from "./parse";

/**
 * Provider-agnostic cert lookup.
 *
 * Pre-launch stub: a small in-memory fixture stands in for the real GIA / AGS
 * report-number lookup service. The interface (input, statuses, message shape)
 * is stable — swap the fixture for a live provider call by replacing the
 * implementation of `fetchReportFromProvider` and its edge-case handling
 * without touching any caller.
 *
 * Downstream callers MUST treat every non-`verified` status as a signal to
 * NOT release funds — see the escrow arrival-check route.
 */

// Fixture data. The keys are canonical (normalized) cert numbers.
const FIXTURE_REPORTS: Record<string, CertReport> = {
  "1234567890": {
    certNumber: "1234567890",
    lab: "GIA",
    shape: "Round",
    carat: 1.02,
    color: "D",
    clarity: "VVS1",
    cutGrade: "Excellent",
    dimensionsMm: { length: 6.48, width: 6.5, depth: 3.99 },
  },
  "22334455667": {
    certNumber: "22334455667",
    lab: "GIA",
    shape: "Oval",
    carat: 1.51,
    color: "E",
    clarity: "VVS2",
    cutGrade: "Very Good",
    dimensionsMm: { length: 8.9, width: 6.1, depth: 3.75 },
  },
  AGS10420193: {
    certNumber: "AGS10420193",
    lab: "AGS",
    shape: "Cushion",
    carat: 0.91,
    color: "F",
    clarity: "VS1",
    cutGrade: "Excellent",
    dimensionsMm: { length: 5.72, width: 5.68, depth: 3.55 },
  },
};

class LookupProviderError extends Error {
  constructor(
    public readonly kind: "timeout" | "unavailable",
    message: string,
  ) {
    super(message);
    this.name = "LookupProviderError";
  }
}

async function fetchReportFromProvider(
  canonical: string,
): Promise<CertReport | null> {
  // Fixture provider: sync in effect but async in shape so the real provider
  // (which will be a fetch call to a GIA/AGS API) is a drop-in replacement.
  return FIXTURE_REPORTS[canonical] ?? null;
}

export async function lookupCert(rawCertNumber: string): Promise<CertLookupResponse> {
  if (typeof rawCertNumber !== "string" || rawCertNumber.trim() === "") {
    return {
      status: "not_found",
      message: "Certificate number is required.",
    };
  }

  if (!isValidCertNumber(rawCertNumber)) {
    return {
      status: "not_found",
      message: "Certificate number is not a recognized GIA or AGS format.",
    };
  }

  const canonical = normalizeCertNumber(rawCertNumber);
  const lab = detectCertLab(canonical);

  try {
    const report = await fetchReportFromProvider(canonical);
    if (!report) {
      return {
        status: "not_found",
        message: `No ${lab ?? "GIA/AGS"} report found for ${canonical}.`,
      };
    }
    return {
      status: "verified",
      message: `Report ${canonical} verified against the ${report.lab} database.`,
      report,
    };
  } catch (err) {
    if (err instanceof LookupProviderError) {
      // Retryable — do NOT downgrade to `not_found`, which would silently
      // pass verification for an unknown stone.
      return {
        status: "pending",
        message:
          err.kind === "timeout"
            ? "Certificate lookup timed out. Please retry in a moment."
            : "Certificate lookup is temporarily unavailable. Please retry.",
      };
    }
    throw err;
  }
}

// Exported for tests + so a future provider swap can throw the same shape.
export { LookupProviderError };
