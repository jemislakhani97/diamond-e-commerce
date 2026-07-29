import Link from "next/link";

const SHAPES = [
  "Round",
  "Oval",
  "Cushion",
  "Emerald",
  "Princess",
  "Pear",
  "Marquise",
  "Radiant",
  "Asscher",
] as const;

const PILLARS = [
  {
    title: "Every stone graded",
    body: "Every listing carries its original GIA or AGS report, verified against the issuer's database.",
  },
  {
    title: "Compare the 4Cs side-by-side",
    body: "Filter, sort, and stack diamonds by cut, color, clarity, and carat without leaving the page.",
  },
  {
    title: "Escrow-protected checkout",
    body: "Funds are held until you confirm the diamond matches its grading report on arrival.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Filter by the 4Cs",
    body: "Cut, color, clarity, carat. Every listing carries its grading report.",
  },
  {
    num: "02",
    title: "Compare side-by-side",
    body: "Stack two or more stones. See every spec next to each other, no back-and-forth.",
  },
  {
    num: "03",
    title: "Pay into escrow",
    body: "A third-party escrow provider holds your funds until the diamond arrives.",
  },
  {
    num: "04",
    title: "Confirm and settle",
    body: "Verify the stone matches its report. Funds release. Done.",
  },
];

const TRUST = [
  "GIA graded",
  "AGS graded",
  "Escrow-secured",
  "Independent report verification",
];

const FAQS = [
  {
    q: "What's the difference between natural and lab-grown?",
    a: "Natural diamonds form underground over billions of years. Lab-grown diamonds are created in a lab and have the same optical, physical, and chemical properties. Both are graded to the same 4Cs standard.",
  },
  {
    q: "How does escrow work here?",
    a: "Your payment is held by a third-party escrow provider until you confirm the diamond arrived and matches the grading report. If it doesn't, funds return to you.",
  },
  {
    q: "Which certifications do you accept?",
    a: "Every listing includes a grading report from GIA or AGS. We verify each report against the issuer's database before the stone goes live.",
  },
  {
    q: "Can I return a diamond?",
    a: "Yes. If the stone doesn't match its grading report or your expectations, return it within the window shown on the listing and escrow releases your funds back to you.",
  },
];

function DiamondMark({ label, className }: { label: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className ?? "h-8 w-8"}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-label={label}
      role="img"
    >
      <path d="M14 8h20l6 10L24 42 8 18l6-10Z" />
      <path d="M8 18h32M14 8l10 10 10-10M20 8l4 10 4-10" />
    </svg>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-serif text-xl tracking-wide text-slate-900">
          Diamond Marketplace
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link href="/search" className="hover:text-amber-700">
            Shop
          </Link>
          <Link href="/sell" className="hover:text-amber-700">
            Sell inventory
          </Link>
          <Link href="/certifications" className="hover:text-amber-700">
            Certifications
          </Link>
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/sign-in" className="hover:text-amber-700">
            Sign in
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-stone-300 px-3.5 py-1.5 hover:border-slate-900"
          >
            Cart
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-20 pb-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-serif text-5xl leading-tight tracking-tight text-slate-900 sm:text-6xl">
          Certified diamonds, side-by-side.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">
          Compare natural and lab-grown stones by cut, color, clarity, and carat.
          Every diamond GIA or AGS graded. Every purchase escrow-protected.
        </p>
      </div>
      <form
        action="/search"
        className="mx-auto mt-10 max-w-4xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <fieldset>
          <legend className="sr-only">Filter by shape</legend>
          <div className="flex flex-wrap gap-2">
            {SHAPES.map((s) => (
              <label
                key={s}
                className="cursor-pointer rounded-full border border-stone-300 px-4 py-1.5 text-sm text-slate-700 select-none has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white hover:border-slate-900"
              >
                <input
                  type="checkbox"
                  name="shape"
                  value={s.toLowerCase()}
                  defaultChecked={s === "Round"}
                  className="sr-only"
                />
                {s}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="carat_min"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Carat (min)
            </label>
            <input
              id="carat_min"
              type="number"
              step="0.1"
              min="0.3"
              max="10"
              defaultValue="0.5"
              name="carat_min"
              className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="carat_max"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Carat (max)
            </label>
            <input
              id="carat_max"
              type="number"
              step="0.1"
              min="0.3"
              max="10"
              defaultValue="2.0"
              name="carat_max"
              className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="price_max"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Price ceiling (USD)
            </label>
            <input
              id="price_max"
              type="number"
              step="500"
              min="500"
              name="price_max"
              placeholder="Any"
              className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/sell" className="text-sm text-slate-600 hover:text-amber-700">
            Selling? List your inventory →
          </Link>
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Search diamonds
          </button>
        </div>
      </form>
    </section>
  );
}

function ValuePillars() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 md:grid-cols-3">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-stone-200 bg-white p-6"
          >
            <div className="text-amber-700">
              <DiamondMark label={p.title} />
            </div>
            <h3 className="mt-4 font-serif text-xl text-slate-900">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShopByShape() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="font-serif text-3xl text-slate-900">Shop by shape</h2>
      <p className="mt-2 text-slate-600">Nine cuts. Same grading standard.</p>
      <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-3 lg:grid-cols-9">
        {SHAPES.map((s) => (
          <Link
            key={s}
            href={`/search?shape=${s.toLowerCase()}`}
            className="group flex flex-col items-center rounded-xl border border-stone-200 bg-white p-4 hover:border-slate-900"
          >
            <div className="text-slate-700 group-hover:text-amber-700">
              <DiamondMark label={s} />
            </div>
            <span className="mt-2 text-sm text-slate-700">{s}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function NaturalVsLabGrown() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-8">
          <h3 className="font-serif text-2xl text-slate-900">Natural diamonds</h3>
          <p className="mt-3 leading-relaxed text-slate-600">
            Earth-mined, formed over{" "}
            <span className="font-medium text-slate-900">billions of years</span>,
            and traceable to the mine of origin where the report allows. Graded to
            the 4Cs standard by GIA or AGS.
          </p>
          <Link
            href="/search?origin=natural"
            className="mt-4 inline-block text-sm text-amber-700 hover:text-amber-800"
          >
            Shop natural →
          </Link>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-8">
          <h3 className="font-serif text-2xl text-slate-900">Lab-grown diamonds</h3>
          <p className="mt-3 leading-relaxed text-slate-600">
            Created in a lab with the{" "}
            <span className="font-medium text-slate-900">
              same optical, physical, and chemical properties
            </span>{" "}
            as natural stones. Graded to the same 4Cs standard, typically at a
            lower price per carat.
          </p>
          <Link
            href="/search?origin=lab-grown"
            className="mt-4 inline-block text-sm text-amber-700 hover:text-amber-800"
          >
            Shop lab-grown →
          </Link>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="font-serif text-3xl text-slate-900">How it works</h2>
      <p className="mt-2 text-slate-600">From search to settlement, in four steps.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.num} className="py-2">
            <div className="font-serif text-3xl text-amber-700">{s.num}</div>
            <h4 className="mt-2 font-serif text-lg text-slate-900">{s.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DealerBand() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-8 rounded-3xl bg-slate-900 px-8 py-14 text-white sm:px-12">
        <div className="max-w-xl">
          <h3 className="font-serif text-2xl sm:text-3xl">
            Are you a jewelry retailer?
          </h3>
          <p className="mt-2 text-slate-300">
            Restock certified inventory in bulk with dealer pricing, tiered escrow
            terms, and API access to the catalog. No listing fees.
          </p>
        </div>
        <Link
          href="/dealer-access"
          className="rounded-full bg-white px-7 py-3 text-sm font-medium text-slate-900 hover:bg-stone-100"
        >
          Apply for dealer access →
        </Link>
      </div>
    </section>
  );
}

function TrustRow() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-around gap-4 rounded-2xl border border-stone-200 bg-white p-6">
        {TRUST.map((t) => (
          <div key={t} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-amber-700">
              <DiamondMark label={t} className="h-6 w-6" />
            </span>
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="font-serif text-3xl text-slate-900">Questions before you buy</h2>
      <div className="mt-8 flex flex-col gap-3">
        {FAQS.map((f) => (
          <div
            key={f.q}
            className="rounded-xl border border-stone-200 bg-white px-6 py-5"
          >
            <div className="text-base font-medium text-slate-900">{f.q}</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-stone-200 py-12 text-sm text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6 px-6">
        <div>
          <div className="font-serif text-xl text-slate-900">Diamond Marketplace</div>
          <div className="mt-2">Certified natural & lab-grown diamonds.</div>
        </div>
        <div className="flex flex-wrap gap-12">
          <div className="flex flex-col gap-2">
            <strong className="font-medium text-slate-900">Shop</strong>
            <Link href="/search">Search</Link>
            <Link href="/search?by=shape">By shape</Link>
            <Link href="/search?origin=lab-grown">Lab-grown</Link>
          </div>
          <div className="flex flex-col gap-2">
            <strong className="font-medium text-slate-900">Sell</strong>
            <Link href="/sell">List inventory</Link>
            <Link href="/dealer-access">Dealer access</Link>
          </div>
          <div className="flex flex-col gap-2">
            <strong className="font-medium text-slate-900">Trust</strong>
            <Link href="/certifications">Certifications</Link>
            <Link href="/escrow-policy">Escrow policy</Link>
            <Link href="/return-policy">Return policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-full flex-1 bg-stone-50 text-slate-900">
      <SiteHeader />
      <Hero />
      <ValuePillars />
      <ShopByShape />
      <NaturalVsLabGrown />
      <HowItWorks />
      <DealerBand />
      <TrustRow />
      <Faq />
      <SiteFooter />
    </div>
  );
}
