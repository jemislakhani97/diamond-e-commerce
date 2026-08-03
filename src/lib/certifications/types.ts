/**
 * Shared vocabulary for the certification verification service.
 *
 * These types are the contract between the cert-lookup endpoint, the image-match
 * helper, the escrow arrival-check endpoint, and the CertBadge component. Keep
 * the string unions in sync across all four surfaces.
 */

export type CertLab = "GIA" | "AGS";

export type VerificationStatus =
  | "verified"
  | "pending"
  | "mismatch"
  | "not_found";

/**
 * Structured grading data returned by a successful cert lookup.
 * Mirrors the fields common to GIA and AGS reports.
 */
export interface CertReport {
  certNumber: string;
  lab: CertLab;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cutGrade: string;
  // Dimensions in millimeters. AGS/GIA reports print these as L x W x D.
  dimensionsMm: {
    length: number;
    width: number;
    depth: number;
  };
}

export interface CertLookupResponse {
  status: VerificationStatus;
  message: string;
  report?: CertReport;
}

/**
 * Result of the escrow arrival-check flow.
 * `go` releases funds; `hold` blocks release. Callers MUST NOT release funds
 * on any status other than `go`.
 */
export type ArrivalCheckStatus = "go" | "hold";

export interface ArrivalCheckResponse {
  status: ArrivalCheckStatus;
  // Detail explaining why release was blocked. Always populated on `hold`.
  reason?: string;
  message: string;
  // Downstream verification signals — populated when a lookup was attempted.
  verification?: VerificationStatus;
  imageConfidence?: number;
}
