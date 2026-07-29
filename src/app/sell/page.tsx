import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List certified inventory — Diamond Marketplace",
  description:
    "Reach buyers who filter by report number. Escrow-secured payouts, no chargeback risk.",
};

const STEPS = [
  {
    num: "01",
    title: "Upload the report",
    body: "Drop the GIA or AGS PDF. We pull the report number and grading data automatically.",
  },
  {
    num: "02",
    title: "Add stills and video",
    body: "One video (up to 30s), one still per angle. Standard imaging on white background.",
  },
  {
    num: "03",
    title: "Set price and terms",
    body: "Price, return window, and ship-by window. Payouts through escrow after buyer confirms arrival.",
  },
];

function SellHero() {
  return (
    <section className="max-w-3xl">
      <h1 className="font-serif text-4xl leading-tight text-slate-900 sm:text-5xl">
        List certified inventory.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-slate-600">
        Reach buyers who filter by report number. Ship on your schedule. Escrow
        pays you out the moment the buyer confirms arrival, no chargeback risk.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Start a listing
        </button>
        <button
          type="button"
          className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:border-slate-900"
        >
          Bulk upload (CSV)
        </button>
      </div>
    </section>
  );
}

function SellStepsList() {
  return (
    <section
      className="mt-16 grid gap-6 md:grid-cols-3"
      aria-label="How selling works"
    >
      {STEPS.map((s) => (
        <div
          key={s.num}
          className="rounded-2xl border border-stone-200 bg-white p-6"
        >
          <div className="font-serif text-3xl text-amber-700">{s.num}</div>
          <h3 className="mt-2 font-serif text-lg text-slate-900">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
        </div>
      ))}
    </section>
  );
}

function TextField({
  label,
  name,
  type,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type: "text" | "email";
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-medium uppercase tracking-wide text-slate-500"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
      />
    </div>
  );
}

function SellIntakeForm() {
  return (
    <form
      className="mt-12 max-w-3xl rounded-2xl border border-stone-200 bg-white p-8"
      action="/sell"
      method="post"
    >
      <h3 className="font-serif text-xl text-slate-900">
        Get on the waitlist for early access
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        We&apos;re onboarding sellers in cohorts before we open to buyers. Add
        your details and we&apos;ll reach out with a slot.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TextField
          label="Business name"
          name="business"
          type="text"
          placeholder="Vale Diamonds LLC"
          autoComplete="organization"
        />
        <TextField
          label="Contact name"
          name="contact"
          type="text"
          placeholder="Jane Doe"
          autoComplete="name"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="you@business.com"
          autoComplete="email"
        />
        <div>
          <label
            htmlFor="volume"
            className="block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Monthly listing volume
          </label>
          <select
            id="volume"
            name="volume"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            <option value="" disabled>
              Choose a range
            </option>
            <option value="1-10">1–10 stones</option>
            <option value="11-50">11–50 stones</option>
            <option value="51-200">51–200 stones</option>
            <option value="200+">200+ stones</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="notes"
            className="block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Anything else?
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Current channels, inventory mix, questions..."
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Request access
        </button>
      </div>
    </form>
  );
}

export default function SellPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <SellHero />
      <SellStepsList />
      <SellIntakeForm />
    </div>
  );
}
