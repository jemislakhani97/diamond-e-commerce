"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { CertBadge } from "@/components/certification/CertBadge";
import {
  CLARITY_GRADES,
  COLOR_GRADES,
  CUT_GRADES,
  LISTINGS,
} from "@/lib/listings/fixtures";
import type { Listing } from "@/lib/listings/types";
import {
  filterListings,
  filtersToQueryString,
  parseFiltersFromParams,
  validateFilters,
  type SearchFilters,
} from "@/lib/search/filter";

/**
 * Buyer /search UI.
 *
 * URL query params are the source of truth for filter state — every panel
 * change writes back to the URL with router.replace(), which means:
 *   1) the view is shareable / bookmarkable,
 *   2) the panel pre-populates from the URL on first load (AC4),
 *   3) reloading preserves the filtered view.
 *
 * The pure filter/validator/serializer live in `src/lib/search/filter.ts` so
 * they can be unit-tested without React or a DOM.
 */
export function SearchClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters = useMemo(
    () => parseFiltersFromParams(params ?? new URLSearchParams()),
    [params],
  );
  const validation = validateFilters(filters);
  const results = filterListings(LISTINGS, filters);

  const updateFilter = useCallback(
    (patch: Partial<SearchFilters>) => {
      const next: SearchFilters = { ...filters, ...patch };
      const qs = filtersToQueryString(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const activeCount =
    (filters.cut ? 1 : 0) +
    (filters.color ? 1 : 0) +
    (filters.clarity ? 1 : 0) +
    (typeof filters.caratMin === "number" ? 1 : 0) +
    (typeof filters.caratMax === "number" ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-slate-900 sm:text-5xl">
            Search certified diamonds.
          </h1>
          <p className="mt-2 text-slate-600">
            Every stone GIA or AGS graded. Compare the 4Cs side-by-side.
          </p>
        </div>
        <p className="text-sm text-slate-500" aria-live="polite">
          {results.length} of {LISTINGS.length} stones
          {activeCount > 0 ? ` · ${activeCount} filter${activeCount === 1 ? "" : "s"} active` : ""}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <FilterPanel
          filters={filters}
          validation={validation}
          onChange={updateFilter}
          onClear={clearFilters}
        />
        <ResultsGrid results={results} caratRangeInvalid={validation.caratRangeInvalid} />
      </div>
    </div>
  );
}

function FilterPanel({
  filters,
  validation,
  onChange,
  onClear,
}: {
  filters: SearchFilters;
  validation: { caratRangeInvalid: boolean };
  onChange: (patch: Partial<SearchFilters>) => void;
  onClear: () => void;
}) {
  return (
    <aside
      className="h-fit rounded-2xl border border-stone-200 bg-white p-6"
      aria-label="Filters"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Filters
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-amber-700 hover:text-amber-800"
        >
          Clear all
        </button>
      </div>

      <FilterGroup title="Cut" htmlFor="filter-cut">
        <select
          id="filter-cut"
          name="cut"
          value={filters.cut ?? ""}
          onChange={(e) => onChange({ cut: e.target.value || undefined })}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        >
          <option value="">Any</option>
          {CUT_GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Color" htmlFor="filter-color">
        <select
          id="filter-color"
          name="color"
          value={filters.color ?? ""}
          onChange={(e) => onChange({ color: e.target.value || undefined })}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        >
          <option value="">Any</option>
          {COLOR_GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Clarity" htmlFor="filter-clarity">
        <select
          id="filter-clarity"
          name="clarity"
          value={filters.clarity ?? ""}
          onChange={(e) => onChange({ clarity: e.target.value || undefined })}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        >
          <option value="">Any</option>
          {CLARITY_GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Carat">
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="filter-carat-min" className="sr-only">
              Carat minimum
            </label>
            <input
              id="filter-carat-min"
              name="carat_min"
              type="number"
              step="0.01"
              min="0"
              placeholder="Min"
              value={filters.caratMin ?? ""}
              onChange={(e) =>
                onChange({
                  caratMin:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              aria-invalid={validation.caratRangeInvalid || undefined}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="filter-carat-max" className="sr-only">
              Carat maximum
            </label>
            <input
              id="filter-carat-max"
              name="carat_max"
              type="number"
              step="0.01"
              min="0"
              placeholder="Max"
              value={filters.caratMax ?? ""}
              onChange={(e) =>
                onChange({
                  caratMax:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              aria-invalid={validation.caratRangeInvalid || undefined}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>
        {validation.caratRangeInvalid ? (
          <p role="alert" className="mt-2 text-xs text-rose-700">
            Carat minimum can&apos;t be greater than the maximum.
          </p>
        ) : null}
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({
  title,
  htmlFor,
  children,
}: {
  title: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-stone-200 pt-4 first-of-type:mt-4">
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
        >
          {title}
        </label>
      ) : (
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function ResultsGrid({
  results,
  caratRangeInvalid,
}: {
  results: Listing[];
  caratRangeInvalid: boolean;
}) {
  if (caratRangeInvalid) {
    return (
      <section
        className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-800"
        aria-label="Filter error"
      >
        Adjust the carat range to see results. The minimum carat is greater
        than the maximum.
      </section>
    );
  }

  if (results.length === 0) {
    return (
      <section
        className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center"
        aria-label="No matching diamonds"
      >
        <h2 className="font-serif text-xl text-slate-900">
          No diamonds match your criteria
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Try widening the carat range or clearing a filter to see more stones.
        </p>
      </section>
    );
  }

  return (
    <section
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Search results"
    >
      {results.map((l) => (
        <ResultCard key={l.id} listing={l} />
      ))}
    </section>
  );
}

function ResultCard({ listing }: { listing: Listing }) {
  const summary = `${listing.color} · ${listing.clarity} · ${listing.cut}`;
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-stone-400">
        <DiamondMark />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-base text-slate-900">{listing.name}</h3>
          <p className="text-sm font-semibold text-slate-900">
            ${listing.priceUsd.toLocaleString()}
          </p>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {listing.carat.toFixed(2)} ct · {summary}
        </p>
        <div className="mt-3">
          <CertBadge
            status={listing.status}
            certNumber={listing.certNumber}
            lab={listing.lab}
          />
        </div>
        <Link
          href={`/listings/${listing.id}`}
          aria-label={`View details for ${listing.name}`}
          className="mt-4 inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:border-slate-900"
        >
          View details →
        </Link>
      </div>
    </article>
  );
}

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
