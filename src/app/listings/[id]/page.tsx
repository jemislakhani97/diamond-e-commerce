import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CertBadge } from "@/components/certification/CertBadge";
import { findListing, LISTINGS } from "@/lib/listings/fixtures";
import { PurchaseButton } from "./PurchaseButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = findListing(id);
  if (!listing) return { title: "Listing not found — Diamond Marketplace" };
  return {
    title: `${listing.name} — Diamond Marketplace`,
    description: listing.description,
  };
}

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ id: l.id }));
}

function formatUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = findListing(id);
  if (!listing) notFound();

  const hasImage = listing.images.length > 0;
  const purchasable = listing.cert_status === "verified" && hasImage;

  const disabledReason = !purchasable
    ? listing.cert_status !== "verified"
      ? "Purchase is disabled until certification is verified."
      : "Purchase is disabled until imagery is on file."
    : undefined;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16" aria-label="Listing detail">
      <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/search" className="hover:text-amber-700">
          Shop
        </Link>{" "}
        <span aria-hidden="true">›</span>{" "}
        <span className="text-slate-700">{listing.id}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <section
          className="rounded-2xl border border-stone-200 bg-white"
          aria-label="Listing imagery"
        >
          {hasImage ? (
            <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-stone-500">
              <span className="text-xs">
                {listing.images.length} image
                {listing.images.length === 1 ? "" : "s"} on file
              </span>
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center bg-stone-100 text-slate-500">
              <span className="text-xs">Imagery pending</span>
            </div>
          )}
        </section>

        <section aria-label="Listing details">
          <h1 className="font-serif text-3xl text-slate-900 sm:text-4xl">
            {listing.name}
          </h1>
          <p className="mt-2 text-slate-600">
            {listing.color} · {listing.clarity} · {listing.cutGrade} ·{" "}
            {listing.origin === "lab-grown" ? "Lab-grown" : "Natural"}
          </p>

          <div className="mt-4">
            <CertBadge
              status={listing.cert_status}
              certNumber={listing.cert_number}
              lab={listing.lab}
            />
          </div>

          <p className="mt-6 text-3xl font-semibold text-slate-900">
            {formatUSD(listing.price_cents)}
          </p>

          <p className="mt-4 text-sm text-slate-600">{listing.description}</p>

          <div className="mt-8">
            <PurchaseButton
              listingId={listing.id}
              disabled={!purchasable}
              disabledReason={disabledReason}
            />
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Payment held in escrow until delivery is confirmed.{" "}
            <Link href="/escrow-policy" className="underline hover:text-amber-700">
              How escrow works
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
