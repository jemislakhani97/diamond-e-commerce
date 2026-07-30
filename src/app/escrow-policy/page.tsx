import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Escrow policy — Diamond Marketplace",
  description:
    "Every purchase is held in third-party escrow. Funds release only after the buyer confirms the diamond matches its grading report — or are returned in full if it doesn't.",
};

const ESCROW_STEPS = [
  {
    num: "01",
    title: "Payment held in escrow",
    body: "At checkout, your payment is transferred to a third-party escrow account. The seller is notified the funds are secured but does not receive them yet.",
  },
  {
    num: "02",
    title: "Stone shipped and inspected",
    body: "The seller ships the diamond directly to you (or to an inspection partner). On arrival, the laser-inscribed report number is checked against the grading report.",
  },
  {
    num: "03",
    title: "Release or return",
    body: "If every graded field matches the report, escrow releases funds to the seller. If the stone does not match, funds are returned to you in full and the stone goes back.",
  },
];

const PROTECTS = [
  {
    tag: "Buyer",
    name: "You only pay for what was graded",
    body: "The report defines what you bought. Nothing releases from escrow until the stone in your hand matches the fields on that report.",
  },
  {
    tag: "Seller",
    name: "Funds are secured before you ship",
    body: "You know payment is already in escrow before packing the stone. No chargebacks after the fact, no chasing wires.",
  },
];

function EscrowHero() {
  return (
    <section className="max-w-3xl" aria-label="Escrow policy intro">
      <h1 className="font-serif text-4xl leading-tight text-slate-900 sm:text-5xl">
        Your payment is protected until delivery.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-slate-600">
        Every transaction on the marketplace settles through a third-party
        escrow account. Funds are held until you confirm that the diamond you
        received matches the grading report it was listed with, and are
        returned in full if it doesn&apos;t.
      </p>
    </section>
  );
}

function EscrowProcess() {
  return (
    <section className="mt-16" aria-label="How escrow works">
      <h2 className="font-serif text-3xl text-slate-900">How escrow works</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ESCROW_STEPS.map((s) => (
          <div
            key={s.num}
            className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-6"
          >
            <div className="font-serif text-3xl text-amber-700">{s.num}</div>
            <h3 className="mt-2 font-serif text-lg text-slate-900">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhatEscrowProtects() {
  return (
    <section className="mt-16" aria-label="What escrow protects">
      <h2 className="font-serif text-3xl text-slate-900">
        What escrow protects
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {PROTECTS.map((p) => (
          <div
            key={p.name}
            className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-6"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              {p.tag}
            </span>
            <h3 className="font-serif text-xl text-slate-900">{p.name}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EscrowCallout() {
  return (
    <section
      className="mt-16 rounded-2xl bg-slate-900 p-8 text-white"
      aria-label="Related trust surfaces"
    >
      <h3 className="font-serif text-xl">
        Certification is what escrow releases against
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">
        Escrow only makes sense because every listing carries a verified
        grading report. See how we accept, verify, and match those reports
        before a stone goes live.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/certifications"
          className="inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:bg-stone-100"
        >
          How certification works →
        </Link>
        <Link
          href="/return-policy"
          className="inline-block rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white hover:border-white"
        >
          Return policy →
        </Link>
      </div>
    </section>
  );
}

export default function EscrowPolicyPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <EscrowHero />
      <EscrowProcess />
      <WhatEscrowProtects />
      <EscrowCallout />
    </div>
  );
}
