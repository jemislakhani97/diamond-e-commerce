import type { VerificationStatus } from "@/lib/certifications/types";

/**
 * CertBadge — visual chip for a listing's certification status.
 *
 * Rendered on listing detail (and anywhere a stone is shown alongside its
 * trust signal). Colors follow the site palette convention: emerald for
 * verified, amber for pending / unverified, rose for mismatch.
 */

export type CertBadgeStatus = VerificationStatus | "unverified";

const STATUS_STYLES: Record<
  CertBadgeStatus,
  { label: string; className: string; dotClassName: string }
> = {
  verified: {
    label: "Verified",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dotClassName: "bg-emerald-600",
  },
  pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-500",
  },
  mismatch: {
    label: "Mismatch",
    className: "border-rose-200 bg-rose-50 text-rose-800",
    dotClassName: "bg-rose-600",
  },
  not_found: {
    label: "Not found",
    className: "border-rose-200 bg-rose-50 text-rose-800",
    dotClassName: "bg-rose-600",
  },
  unverified: {
    label: "Unverified",
    className: "border-stone-300 bg-stone-100 text-slate-600",
    dotClassName: "bg-slate-400",
  },
};

export interface CertBadgeProps {
  status: CertBadgeStatus;
  certNumber?: string;
  lab?: "GIA" | "AGS";
  className?: string;
}

export function CertBadge({
  status,
  certNumber,
  lab,
  className,
}: CertBadgeProps) {
  const style = STATUS_STYLES[status];
  const detail =
    lab && certNumber
      ? `${lab} · ${certNumber}`
      : certNumber
        ? certNumber
        : lab
          ? lab
          : null;

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        style.className,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`Certification status: ${style.label}${detail ? ` (${detail})` : ""}`}
      role="status"
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${style.dotClassName}`}
      />
      <span>{style.label}</span>
      {detail ? (
        <span className="font-normal text-slate-500">· {detail}</span>
      ) : null}
    </span>
  );
}
