import type { CertBadgeStatus } from "@/components/certification/CertBadge";
import type { CertLab } from "@/lib/certifications/types";

/**
 * Buyer-facing listing shape.
 *
 * Small on purpose — this is the pre-launch fixture model. The 4C fields
 * mirror what a GIA/AGS report actually carries, so filter values on the
 * /search page compare like-for-like against grading data.
 *
 * `status` is the certification verdict rendered by CertBadge on each result
 * card. `certNumber` + `lab` are shown alongside the badge so the buyer sees
 * the actual report they can cross-check.
 */
export interface Listing {
  id: string;
  name: string;
  shape: string;
  carat: number;
  /** Cut grade, GIA/AGS scale: Excellent | Very Good | Good | Fair | Poor */
  cut: string;
  /** Color grade, D (colorless) through Z. */
  color: string;
  /** Clarity grade: FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2, I1, I2. */
  clarity: string;
  lab: CertLab;
  certNumber: string;
  status: CertBadgeStatus;
  priceUsd: number;
  origin: "natural" | "lab-grown";
}
