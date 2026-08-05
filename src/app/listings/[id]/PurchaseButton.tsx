"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PurchaseButtonProps {
  listingId: string;
  disabled?: boolean;
  disabledReason?: string;
}

/**
 * Purchase CTA — POSTs to /api/checkout with { listing_id } and, on success,
 * redirects to /checkout/confirm?pid=... The server route also enforces the
 * cert-verified + image-present gate; the disabled state here is UX only.
 */
export function PurchaseButton({
  listingId,
  disabled,
  disabledReason,
}: PurchaseButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (disabled || busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listing_id: listingId }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          (typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof (data as { message: unknown }).message === "string" &&
            (data as { message: string }).message) ||
          "Could not start checkout.";
        setError(message);
        return;
      }
      const pid =
        typeof data === "object" &&
        data !== null &&
        "payment_intent_id" in data &&
        typeof (data as { payment_intent_id: unknown }).payment_intent_id ===
          "string"
          ? (data as { payment_intent_id: string }).payment_intent_id
          : null;
      if (!pid) {
        setError("Checkout succeeded but no payment reference was returned.");
        return;
      }
      router.push(`/checkout/confirm?pid=${encodeURIComponent(pid)}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || busy}
        aria-disabled={disabled || busy}
        className="rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-slate-500"
      >
        {busy ? "Starting checkout…" : "Purchase"}
      </button>
      {disabled && disabledReason ? (
        <p className="mt-2 text-xs text-slate-500">{disabledReason}</p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-2 text-xs text-rose-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
