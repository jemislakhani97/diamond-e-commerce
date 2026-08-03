import type { CertLab } from "./types";

/**
 * Cert-number format detectors.
 *
 * GIA report numbers are 10 or 11 digit strings (recent-era GIA reports moved
 * from 10 to 11 digits). AGS Laboratories report numbers are 8-10 digit
 * strings, historically prefixed with the letters "AGS" when printed on the
 * report jacket though not always when entered by users.
 *
 * These are format checks only — they say nothing about whether the number
 * actually exists in the issuer's database. Use `lookupCert` for that.
 */

const GIA_PATTERN = /^\d{10,11}$/;
const AGS_PATTERN = /^(?:AGS)?\d{7,10}$/i;

export function normalizeCertNumber(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]/g, "");
}

export function detectCertLab(raw: string): CertLab | null {
  const n = normalizeCertNumber(raw);
  if (!n) return null;
  // AGS if explicitly prefixed. Otherwise fall through to GIA vs AGS by length.
  if (/^AGS\d+$/.test(n)) return "AGS";
  // GIA report numbers are always all-digits, 10 or 11 chars.
  if (GIA_PATTERN.test(n)) return "GIA";
  // AGS numbers without prefix: 7-10 digits (shorter than GIA).
  if (/^\d{7,9}$/.test(n)) return "AGS";
  return null;
}

export function isValidCertNumber(raw: string): boolean {
  const n = normalizeCertNumber(raw);
  return GIA_PATTERN.test(n) || AGS_PATTERN.test(n);
}
