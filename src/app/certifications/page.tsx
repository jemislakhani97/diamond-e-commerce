import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certifications — Diamond Marketplace",
  description:
    "GIA and AGS graded diamonds only. Every report number verified against the issuer's database before listing.",
};

const LABS = [
  {
    tag: "Accepted",
    name: "GIA — Gemological Institute of America",
    body: "Non-profit institute that authored the modern 4Cs grading scale. Reports include a plotted clarity diagram, cut grade, and a unique report number laser-inscribed on the diamond's girdle.",
  },
  {
    tag: "Accepted",
    name: "AGS — American Gem Society Laboratories",
    body: "Known for its light-performance cut grading. Reports carry a unique cert number verifiable through the AGS database and cover the same 4Cs plus proportion analysis.",
  },
];

const VERIFY_STEPS = [
  {
    num: "01",
    title: "Report intake",
    body: "Seller uploads the original PDF from GIA or AGS.",
  },
  {
    num: "02",
    title: "Database match",
    body: "We look up the report number in the issuer's database and confirm all grading fields match.",
  },
  {
    num: "03",
    title: "Physical check",
    body: "On arrival at the buyer, the laser-inscribed report number is compared against the report.",
  },
  {
    num: "04",
    title: "Escrow release",
    body: "Only after that match confirms does escrow release funds to the seller.",
  },
];

function CertificationsHero() {
  return (
    <section className="max-w-3xl">
      <h1 className="font-serif text-4xl leading-tight text-slate-900 sm:text-5xl">
        Every diamond, independently graded.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-slate-600">
        We accept grading reports from the two labs that set the modern 4Cs
        standard: GIA and AGS. Every report number is verified against the
        issuer&apos;s database before the stone goes live.
      </p>
    </section>
  );
}

function CertificationsGrid() {
  return (
    <section
      className="mt-12 grid gap-6 md:grid-cols-2"
      aria-label="Accepted labs"
    >
      {LABS.map((l) => (
        <div
          key={l.name}
          className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-6"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            {l.tag}
          </span>
          <h3 className="font-serif text-xl text-slate-900">{l.name}</h3>
          <p className="text-sm leading-relaxed text-slate-600">{l.body}</p>
        </div>
      ))}
    </section>
  );
}

function CertificationsProcess() {
  return (
    <section className="mt-16" aria-label="How we verify a stone">
      <h2 className="font-serif text-3xl text-slate-900">
        How we verify a stone
      </h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {VERIFY_STEPS.map((s) => (
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

function TrustCallout() {
  return (
    <section className="mt-16 rounded-2xl bg-slate-900 p-8 text-white">
      <h3 className="font-serif text-xl">Every listing carries its report</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">
        Click into any listing and you&apos;ll see the report number, issuing
        lab, and download link, before you buy, not after.
      </p>
      <div className="mt-6">
        <Link
          href="/search"
          className="inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:bg-stone-100"
        >
          Browse certified diamonds →
        </Link>
      </div>
    </section>
  );
}

export default function CertificationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <CertificationsHero />
      <CertificationsGrid />
      <CertificationsProcess />
      <TrustCallout />
    </div>
  );
}
