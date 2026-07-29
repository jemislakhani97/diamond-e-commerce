import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search certified diamonds — Diamond Marketplace",
  description:
    "Compare GIA and AGS graded natural and lab-grown diamonds by cut, color, clarity, and carat.",
};

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

const COLORS = ["D", "E", "F", "G", "H"] as const;

const RESULTS = [
  { title: "1.02 ct Round", meta: "D · VVS1 · Excellent · GIA", price: "$8,240" },
  { title: "1.51 ct Oval", meta: "E · VVS2 · Very good · GIA", price: "$11,900" },
  { title: "0.91 ct Cushion", meta: "F · VS1 · Excellent · AGS", price: "$5,410" },
  {
    title: "2.03 ct Emerald",
    meta: "D · IF · Excellent · GIA · Lab-grown",
    price: "$9,880",
  },
  { title: "1.20 ct Round", meta: "E · VVS1 · Excellent · GIA", price: "$10,150" },
  { title: "1.75 ct Pear", meta: "F · VS2 · Very good · GIA", price: "$7,320" },
];

function DiamondMark() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-16 w-16 text-stone-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path d="M14 8h20l6 10L24 42 8 18l6-10Z" />
      <path d="M8 18h32M14 8l10 10 10-10" />
    </svg>
  );
}

function ShapeChips() {
  return (
    <fieldset className="mt-6">
      <legend className="sr-only">Diamond shape</legend>
      <div className="flex flex-wrap gap-2">
        {SHAPES.map((s, i) => (
          <label
            key={s}
            className="cursor-pointer rounded-full border border-stone-300 px-4 py-1.5 text-sm text-slate-700 select-none has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white hover:border-slate-900"
          >
            <input
              type="checkbox"
              name="shape"
              value={s.toLowerCase()}
              defaultChecked={i === 0}
              className="sr-only"
            />
            {s}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 border-t border-stone-200 pt-4 first:mt-0 first:border-t-0 first:pt-0">
      <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {title}
      </h4>
      {children}
    </div>
  );
}

function NumInput({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <input
      type="number"
      name={name}
      aria-label={label}
      step="0.1"
      defaultValue={defaultValue}
      className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
    />
  );
}

function CheckboxRow({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 py-1 text-sm text-slate-700">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
      />
      {children}
    </label>
  );
}

function RadioRow({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 py-1 text-sm text-slate-700">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
      />
      {children}
    </label>
  );
}

function SearchFilterSidebar() {
  return (
    <aside
      className="rounded-2xl border border-stone-200 bg-white p-6"
      aria-label="Filters"
    >
      <FilterGroup title="Carat">
        <div className="flex gap-2">
          <NumInput name="carat_min" label="Carat minimum" defaultValue="0.5" />
          <NumInput name="carat_max" label="Carat maximum" defaultValue="2.0" />
        </div>
      </FilterGroup>
      <FilterGroup title="Price (USD)">
        <div className="flex gap-2">
          <NumInput name="price_min" label="Price minimum" defaultValue="500" />
          <NumInput name="price_max" label="Price maximum" defaultValue="15000" />
        </div>
      </FilterGroup>
      <FilterGroup title="Cut">
        <CheckboxRow name="cut" value="excellent" defaultChecked>
          Excellent
        </CheckboxRow>
        <CheckboxRow name="cut" value="very-good" defaultChecked>
          Very good
        </CheckboxRow>
        <CheckboxRow name="cut" value="good">
          Good
        </CheckboxRow>
      </FilterGroup>
      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((g, i) => (
            <label
              key={g}
              className="cursor-pointer rounded-full border border-stone-300 px-2.5 py-1 text-xs text-slate-700 select-none has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white hover:border-slate-900"
            >
              <input
                type="checkbox"
                name="color"
                value={g}
                defaultChecked={i < 3}
                className="sr-only"
              />
              {g}
            </label>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Clarity">
        <CheckboxRow name="clarity" value="fl-if" defaultChecked>
          FL / IF
        </CheckboxRow>
        <CheckboxRow name="clarity" value="vvs" defaultChecked>
          VVS1 / VVS2
        </CheckboxRow>
        <CheckboxRow name="clarity" value="vs">
          VS1 / VS2
        </CheckboxRow>
      </FilterGroup>
      <FilterGroup title="Origin">
        <RadioRow name="origin" value="any" defaultChecked>
          Any
        </RadioRow>
        <RadioRow name="origin" value="natural">
          Natural
        </RadioRow>
        <RadioRow name="origin" value="lab-grown">
          Lab-grown
        </RadioRow>
      </FilterGroup>
      <FilterGroup title="Certification">
        <CheckboxRow name="cert" value="gia" defaultChecked>
          GIA
        </CheckboxRow>
        <CheckboxRow name="cert" value="ags" defaultChecked>
          AGS
        </CheckboxRow>
      </FilterGroup>
    </aside>
  );
}

function SearchResultsGrid() {
  return (
    <section
      className="grid grid-cols-2 gap-6 lg:grid-cols-3"
      aria-label="Search results"
    >
      {RESULTS.map((r) => (
        <article
          key={r.title}
          className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white"
        >
          <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-stone-400">
            <DiamondMark />
          </div>
          <div className="p-4">
            <h3 className="font-serif text-base text-slate-900">{r.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{r.meta}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{r.price}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

export default function SearchPage() {
  return (
    <form action="/search" method="get" className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-slate-900 sm:text-5xl">
            Search certified diamonds.
          </h1>
          <p className="mt-2 text-slate-600">
            Every stone GIA or AGS graded. Compare the 4Cs side-by-side.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="sr-only">
            Sort results
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue="best"
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            <option value="best">Sort: Best match</option>
            <option value="price-asc">Price: low to high</option>
            <option value="carat-desc">Carat: high to low</option>
          </select>
          <span className="text-sm text-slate-500">1,284 stones</span>
        </div>
      </div>
      <ShapeChips />
      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <SearchFilterSidebar />
        <SearchResultsGrid />
      </div>
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}
