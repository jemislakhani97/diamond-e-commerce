import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-serif text-xl tracking-wide text-slate-900"
        >
          Diamond Marketplace
        </Link>
        <nav
          className="hidden items-center gap-8 text-sm md:flex"
          aria-label="Primary"
        >
          <Link href="/search" className="hover:text-amber-700">
            Shop
          </Link>
          <Link href="/listings" className="hover:text-amber-700">
            Browse
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
