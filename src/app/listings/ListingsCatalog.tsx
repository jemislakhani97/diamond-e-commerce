import Link from "next/link";
import { CertBadge } from "@/components/certification/CertBadge";
import type { Listing } from "@/lib/listings/types";

export interface ListingsCatalogProps {
  listings: readonly Listing[];
}

/**
 * Pre-launch catalog browse: renders one card per listing.
 *
 * Exported (rather than inlined into `page.tsx`) so the empty-state and
 * imagery-pending branches can be tested by passing a `listings` prop.
 * Server component — no hooks, safe to `renderToStaticMarkup`.
 */
export function ListingsCatalog({ listings }: ListingsCatalogProps) {
  return (
    <section
      className="mx-auto max-w-7xl px-6 py-16"
      aria-label="Diamond catalog"
    >
      <div className="max-w-3xl">
        <h1 className="font-serif text-4xl leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Browse certified diamonds.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Every stone is GIA or AGS graded and covered by escrow. Compare the
          4Cs, then open a listing to see the full grading report.
        </p>
      </div>

      {listings.length === 0 ? (
        <EmptyState />
      ) : (
        <ul
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="listings-grid"
        >
          {listings.map((listing) => (
            <li key={listing.id}>
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const summary4C = `${listing.cutGrade} cut · ${listing.color} color · ${listing.clarity} clarity`;
  // Guard against undefined/null images (defense against a fixture shape
  // drift — a broken img is worse than an "Imagery pending" fallback).
  const hasImagery = Array.isArray(listing.images) && listing.images.length > 0;

  return (
    <article
      className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6"
      data-testid="listing-card"
      data-listing-id={listing.id}
    >
      <ImageryPlaceholder hasImagery={hasImagery} shape={listing.shape} />

      <div className="mt-4 flex items-start justify-between gap-3">
        <h2 className="font-serif text-xl text-slate-900">{listing.name}</h2>
        <CertBadge
          status={listing.cert.status}
          certNumber={listing.cert.number}
          lab={listing.cert.lab}
        />
      </div>

      <dl className="mt-3 text-sm text-slate-600">
        <div className="flex items-baseline gap-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Carat
          </dt>
          <dd className="text-slate-900">{formatCarat(listing.carat)}</dd>
        </div>
        <div className="mt-1">
          <dt className="sr-only">4C summary</dt>
          <dd>{summary4C}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <span className="font-serif text-lg text-slate-900">
          {formatUsd(listing.priceUsd)}
        </span>
        <Link
          href={`/listings/${listing.id}`}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
          aria-label={`View details for ${listing.name}`}
        >
          View details →
        </Link>
      </div>
    </article>
  );
}

/**
 * Visual placeholder in the card's imagery slot. Never renders a broken
 * `<img>` — when imagery is pending, the fallback is a labeled band.
 */
function ImageryPlaceholder({
  hasImagery,
  shape,
}: {
  hasImagery: boolean;
  shape: string;
}) {
  if (!hasImagery) {
    return (
      <div
        className="flex h-40 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-sm text-slate-500"
        role="status"
        aria-label="Imagery pending"
        data-testid="imagery-pending"
      >
        Imagery pending
      </div>
    );
  }
  return (
    <div
      className="flex h-40 items-center justify-center rounded-xl bg-stone-100 text-slate-500"
      aria-hidden="true"
    >
      <DiamondMark label={shape} />
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center"
      role="status"
      data-testid="listings-empty"
    >
      <h2 className="font-serif text-2xl text-slate-900">
        Inventory arriving soon.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        We&rsquo;re onboarding our first sellers and their stones are being
        graded and photographed now. Check back shortly.
      </p>
    </div>
  );
}

function DiamondMark({ label }: { label: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-12 w-12 text-amber-700"
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

function formatCarat(carat: number): string {
  return `${carat.toFixed(2)} ct`;
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
