import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return policy — Diamond Marketplace",
  description:
    "Every purchase is escrow-backed. If the stone doesn't match its grading report on inspection, you get a full refund and the stone goes back.",
};

const RETURN_STEPS = [
  {
    num: "01",
    title: "Inspect on arrival",
    body: "Compare the diamond you received against the grading report it was listed with. The report number is laser-inscribed on the girdle and must match.",
  },
  {
    num: "02",
    title: "Open a return in your order",
    body: "If a graded field doesn’t match, or the stone otherwise fails inspection, open a return from the order. Escrow does not release while a return is open.",
  },
  {
    num: "03",
    title: "Ship the stone back",
    body: "You’ll receive an insured, tracked return label. Pack the stone with its report and parcel it to the return address on the label.",
  },
  {
    num: "04",
    title: "Escrow returns your funds",
    body: "Once the seller confirms receipt (or the inspection partner does, when we broker the return), escrow releases your payment back to your original method in full.",
  },
];

const WHAT_QUALIFIES = [
  {
    tag: "Covered",
    name: "The stone doesn’t match the report",
    body: "Any measured 4Cs field (cut, color, clarity, carat), the report number, or the plotted clarity map doesn’t match the diamond in front of you.",
  },
  {
    tag: "Covered",
    name: "Damaged or misrepresented on arrival",
    body: "The stone arrives chipped, altered, or otherwise materially different from what was listed and photographed.",
  },
];

function ReturnHero() {
  return (
    <section className="max-w-3xl" aria-label="Return policy intro">
      <h1 className="font-serif text-4xl leading-tight text-slate-900 sm:text-5xl">
        Returns, clearly explained.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-slate-600">
        Every purchase is escrow-backed. If the diamond you receive doesn&apos;t
        match the grading report it was listed with, the return is on us and
        escrow refunds you in full. Here&apos;s how the process runs.
      </p>
    </section>
  );
}

function ReturnProcess() {
  return (
    <section className="mt-16" aria-label="Return process">
      <h2 className="font-serif text-3xl text-slate-900">
        How a return works
      </h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {RETURN_STEPS.map((s) => (
          <div key={s.num}>
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

function WhatQualifies() {
  return (
    <section className="mt-16" aria-label="What qualifies for a return">
      <h2 className="font-serif text-3xl text-slate-900">
        What qualifies for a return
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {WHAT_QUALIFIES.map((w) => (
          <div
            key={w.name}
            className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-6"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              {w.tag}
            </span>
            <h3 className="font-serif text-xl text-slate-900">{w.name}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{w.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-500">
        A precise return window is being finalized before launch and will be
        posted here. Escrow will not release funds to the seller while an open
        return is being reviewed.
      </p>
    </section>
  );
}

function EscrowReleaseNote() {
  return (
    <section
      className="mt-16 rounded-2xl bg-slate-900 p-8 text-white"
      aria-label="Escrow release on confirmed return"
    >
      <h3 className="font-serif text-xl">Escrow release on a confirmed return</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">
        A confirmed return reverses the escrow flow: the seller does not
        receive the funds, and your payment is released back to the method you
        checked out with. You are never asked to wait for the seller to
        voluntarily refund.
      </p>
      <div className="mt-6">
        <Link
          href="/escrow-policy"
          className="inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:bg-stone-100"
        >
          Read the escrow policy →
        </Link>
      </div>
    </section>
  );
}

export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <ReturnHero />
      <ReturnProcess />
      <WhatQualifies />
      <EscrowReleaseNote />
    </div>
  );
}
