import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment pending — Diamond Marketplace",
  description:
    "Your payment is authorized and held in escrow until delivery is confirmed.",
};

interface ConfirmPageProps {
  searchParams: Promise<{ pid?: string | string[] }>;
}

export default async function CheckoutConfirmPage({
  searchParams,
}: ConfirmPageProps) {
  const params = await searchParams;
  const raw = params?.pid;
  const pid = Array.isArray(raw) ? raw[0] : raw;

  return (
    <main
      className="mx-auto max-w-3xl px-6 py-24"
      aria-label="Checkout confirmation"
    >
      <section className="rounded-2xl border border-stone-200 bg-white p-10">
        <h1 className="font-serif text-4xl text-slate-900">
          Payment pending — your order is secured in escrow.
        </h1>
        <p className="mt-4 text-slate-600">
          We are confirming your payment with our processor. Funds are held in
          third-party escrow until the stone arrives and your dimensions match
          the grading report.
        </p>
        {pid ? (
          <p className="mt-6 text-sm text-slate-500">
            Reference:{" "}
            <span className="font-mono text-slate-700">{pid}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Continue browsing
          </Link>
          <Link
            href="/escrow-policy"
            className="rounded-full border border-stone-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-900"
          >
            How escrow works
          </Link>
        </div>
      </section>
    </main>
  );
}
