import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dealer access — Diamond Marketplace",
  description:
    "Dealer access for jewelry retailers: dealer pricing, tiered escrow, and catalog API. Apply for access once your resale license is verified.",
};

const INCLUDED = [
  {
    tag: "Pricing",
    name: "Dealer pricing",
    body: "Tier-based margins on listed inventory, priced against the same third-party grading data buyers see. No opaque markups above the seller's ask.",
  },
  {
    tag: "Escrow",
    name: "Tiered escrow",
    body: "Higher-volume dealers unlock reduced escrow hold times on repeat sellers, with the same buyer-confirmation gate on release.",
  },
  {
    tag: "API",
    name: "Catalog API",
    body: "Programmatic read access to listings filtered by the 4Cs, lab, and report number. Restock without scraping the storefront.",
  },
];

const QUALIFIES = [
  {
    num: "01",
    title: "Registered retailer",
    body: "A registered jewelry business with an operating storefront or e-commerce site under the same legal entity.",
  },
  {
    num: "02",
    title: "Valid resale license",
    body: "A current resale or reseller certificate issued by the tax authority of your jurisdiction. We verify the number before approving access.",
  },
  {
    num: "03",
    title: "Volume tiers",
    body: "Monthly-volume tiers that unlock deeper dealer pricing and shorter escrow holds. Exact thresholds are being finalized before launch.",
  },
];

const VOLUME_RANGES = [
  "Under $10,000 / month",
  "$10,000 – $50,000 / month",
  "$50,000 – $250,000 / month",
  "$250,000 – $1,000,000 / month",
  "Over $1,000,000 / month",
];

function DealerHero() {
  return (
    <section className="max-w-3xl" aria-label="Dealer access intro">
      <h1 className="font-serif text-4xl leading-tight text-slate-900 sm:text-5xl">
        Dealer access for jewelry retailers.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-slate-600">
        A dealer channel for registered retailers restocking certified natural
        and lab-grown inventory. Same grading data buyers see, priced for the
        trade, with escrow terms that reflect your volume.
      </p>
    </section>
  );
}

function WhatsIncluded() {
  return (
    <section className="mt-16" aria-label="What&apos;s included">
      <h2 className="font-serif text-3xl text-slate-900">What&apos;s included</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {INCLUDED.map((i) => (
          <div
            key={i.name}
            className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-6"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              {i.tag}
            </span>
            <h3 className="font-serif text-xl text-slate-900">{i.name}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhoQualifies() {
  return (
    <section className="mt-16" aria-label="Who qualifies">
      <h2 className="font-serif text-3xl text-slate-900">Who qualifies</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {QUALIFIES.map((q) => (
          <div key={q.num}>
            <div className="font-serif text-3xl text-amber-700">{q.num}</div>
            <h3 className="mt-2 font-serif text-lg text-slate-900">{q.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {q.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ApplyForm() {
  return (
    <section className="mt-16" aria-label="Apply for dealer access">
      <div className="rounded-2xl border border-stone-200 bg-white p-8">
        <h2 className="font-serif text-3xl text-slate-900">
          Apply for access
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Share a few details and our dealer team will follow up once your
          resale license is verified.
        </p>
        <form className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="business-name"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Business name
            </label>
            <input
              id="business-name"
              name="business_name"
              type="text"
              required
              autoComplete="organization"
              className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="contact-name"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Contact name
            </label>
            <input
              id="contact-name"
              name="contact_name"
              type="text"
              required
              autoComplete="name"
              className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="resale-license"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Resale license number
            </label>
            <input
              id="resale-license"
              name="resale_license_number"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="country"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              required
              autoComplete="country-name"
              className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="monthly-volume"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Estimated monthly volume
            </label>
            <select
              id="monthly-volume"
              name="monthly_volume"
              required
              defaultValue=""
              className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            >
              <option value="" disabled>
                Select a range
              </option>
              {VOLUME_RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="mt-2 rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Request dealer access
            </button>
            <p className="mt-3 text-xs text-slate-500">
              Our dealer team responds within two business days once we&apos;ve
              verified your resale license.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function DealerAccessPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <DealerHero />
      <WhatsIncluded />
      <WhoQualifies />
      <ApplyForm />
    </div>
  );
}
