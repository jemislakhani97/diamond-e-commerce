import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "./SearchClient";

export const metadata: Metadata = {
  title: "Search certified diamonds — Diamond Marketplace",
  description:
    "Compare GIA and AGS graded natural and lab-grown diamonds by cut, color, clarity, and carat.",
};

/**
 * Server wrapper — keeps `metadata` on a server component (required by Next
 * App Router) while delegating the interactive UI to <SearchClient/>. The
 * Suspense boundary is mandatory around any client subtree that reads
 * `useSearchParams()` in Next 15/16, otherwise build-time prerender bails.
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchClient />
    </Suspense>
  );
}

function SearchLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-6 py-16 text-sm text-slate-500"
      role="status"
      aria-live="polite"
    >
      Loading diamonds…
    </div>
  );
}
