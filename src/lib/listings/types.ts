/**
 * Shared vocabulary for listings.
 *
 * Cert vocabulary reuses the CertBadge status union so the badge and the
 * server-side gate agree on what "verified" means.
 */

import type { CertBadgeStatus } from "@/components/certification/CertBadge";

export type CertStatus = CertBadgeStatus;

export interface Listing {
  id: string;
  name: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cutGrade: string;
  origin: "natural" | "lab-grown";
  /** Cent-denominated price (integer). Sent as `amount` to Stripe as-is. */
  price_cents: number;
  currency: "usd";
  cert_status: CertStatus;
  cert_number?: string;
  lab?: "GIA" | "AGS";
  /** URLs or opaque tokens. A missing/empty list means imagery isn't ready yet. */
  images: string[];
  description: string;
}
