import type { CertBadgeStatus } from "@/components/certification/CertBadge";
import type { CertLab } from "@/lib/certifications/types";

/**
 * Domain types for a listed diamond on the marketplace catalog.
 *
 * The `cert.status` field uses `CertBadgeStatus` so the browse card and the
 * detail page render the same badge without a mapping layer.
 */

export type ListingShape =
  | "Round"
  | "Oval"
  | "Cushion"
  | "Emerald"
  | "Princess"
  | "Pear"
  | "Marquise"
  | "Radiant"
  | "Asscher";

export interface ListingCert {
  lab: CertLab;
  number: string;
  status: CertBadgeStatus;
}

export interface Listing {
  id: string;
  name: string;
  shape: ListingShape;
  carat: number;
  color: string;
  clarity: string;
  cutGrade: string;
  priceUsd: number;
  /** May be an empty array — cards render an "Imagery pending" indicator instead. */
  images: string[];
  cert: ListingCert;
}
