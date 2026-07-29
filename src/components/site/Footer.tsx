import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-stone-200 py-12 text-sm text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6 px-6">
        <div>
          <div className="font-serif text-xl text-slate-900">
            Diamond Marketplace
          </div>
          <div className="mt-2">
            Certified natural &amp; lab-grown diamonds.
          </div>
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
