import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your cart — Diamond Marketplace",
  description:
    "Every purchase is held in escrow until you confirm the diamond arrives and matches its grading report.",
};

const CHECKOUT_STEPS = [
  {
    num: "01",
    title: "Payment held",
    body: "Funds move to escrow. The seller doesn't receive them yet.",
  },
  {
    num: "02",
    title: "Diamond ships",
    body: "Seller ships with tracking and insurance inside the listing's window.",
  },
  {
    num: "03",
    title: "Arrival check",
    body: "You compare the stone to its report, inscription, measurements, condition.",
  },
  {
    num: "04",
    title: "Escrow releases",
    body: "Confirm and funds release. Mismatch and you're refunded.",
  },
];

function CartEmptyState() {
  return (
    <section
      className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center"
      aria-label="Empty cart"
    >
      <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <svg
          viewBox="0 0 48 48"
          width="36"
          height="36"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path d="M14 8h20l6 10L24 42 8 18l6-10Z" />
          <path d="M8 18h32M14 8l10 10 10-10" />
        </svg>
      </div>
      <h2 className="font-serif text-xl text-slate-900">
        No diamonds saved yet.
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
        Start with a shape and a carat range. Every listing shows its GIA or AGS
        report number, side-by-side 4Cs, and its escrow terms before you commit.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/search"
          className="rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Start searching
        </Link>
        <Link
          href="/certifications"
          className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:border-slate-900"
        >
          Read how escrow works
        </Link>
      </div>
    </section>
  );
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-serif text-4xl text-slate-900 sm:text-5xl">
        Your cart.
      </h1>
      <p className="mt-2 text-slate-600">
        Every purchase is held in escrow until you confirm the diamond arrives
        and matches its report.
      </p>
      <CartEmptyState />
      <section
        className="mt-16"
        aria-label="What happens after checkout"
      >
        <h2 className="font-serif text-2xl text-slate-900">
          What happens after checkout
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CHECKOUT_STEPS.map((s) => (
            <div key={s.num}>
              <div className="font-serif text-3xl text-amber-700">{s.num}</div>
              <h3 className="mt-2 font-serif text-lg text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
