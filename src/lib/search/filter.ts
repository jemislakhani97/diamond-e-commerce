import type { Listing } from "@/lib/listings/types";

/**
 * Pure, testable buyer-search filter.
 *
 * All four filters are ANDed. Empty/undefined values mean "no constraint on
 * this axis" — they NEVER narrow the result set. Carat range uses inclusive
 * bounds so a fixture at exactly the min or max is included.
 *
 * URL <-> state contract: URL query params are the source of truth for filter
 * state. `parseFiltersFromParams` reads them; `filtersToQueryString` writes
 * them. Both live here so the page component doesn't hand-roll param parsing
 * (that's how off-by-one filter bugs get shipped).
 */
export interface SearchFilters {
  cut?: string;
  color?: string;
  clarity?: string;
  caratMin?: number;
  caratMax?: number;
}

/**
 * Result of validating a filter set BEFORE applying it. `caratRangeInvalid`
 * fires when a numeric min is strictly greater than a numeric max — the page
 * surfaces that inline instead of silently returning zero results.
 */
export interface FilterValidation {
  ok: boolean;
  caratRangeInvalid: boolean;
}

export function validateFilters(filters: SearchFilters): FilterValidation {
  const hasMin = typeof filters.caratMin === "number" && !Number.isNaN(filters.caratMin);
  const hasMax = typeof filters.caratMax === "number" && !Number.isNaN(filters.caratMax);
  const caratRangeInvalid =
    hasMin && hasMax && (filters.caratMin as number) > (filters.caratMax as number);
  return { ok: !caratRangeInvalid, caratRangeInvalid };
}

export function filterListings(
  listings: readonly Listing[],
  filters: SearchFilters,
): Listing[] {
  const validation = validateFilters(filters);
  // Invalid input isn't the same as "no matches" — surface it as validation,
  // but return [] here so the results grid is empty while the error banner
  // does the explaining. The page relies on that empty-vs-invalid split.
  if (!validation.ok) return [];

  const cut = normalizeString(filters.cut);
  const color = normalizeString(filters.color);
  const clarity = normalizeString(filters.clarity);
  const min = numberOrUndefined(filters.caratMin);
  const max = numberOrUndefined(filters.caratMax);

  return listings.filter((l) => {
    if (cut && l.cut.toLowerCase() !== cut) return false;
    if (color && l.color.toLowerCase() !== color) return false;
    if (clarity && l.clarity.toLowerCase() !== clarity) return false;
    if (typeof min === "number" && l.carat < min) return false;
    if (typeof max === "number" && l.carat > max) return false;
    return true;
  });
}

/**
 * Read filter state from URL query params. Unknown / non-numeric values are
 * dropped silently — the URL is user-editable, so we never throw on garbage.
 * Empty strings are treated as unset so `?cut=` doesn't lock out every stone.
 */
export function parseFiltersFromParams(
  params: URLSearchParams | { get(key: string): string | null },
): SearchFilters {
  const raw = (key: string): string | undefined => {
    const v = params.get(key);
    if (v === null) return undefined;
    const trimmed = v.trim();
    return trimmed === "" ? undefined : trimmed;
  };
  const asNumber = (key: string): number | undefined => {
    const v = raw(key);
    if (v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    cut: raw("cut"),
    color: raw("color"),
    clarity: raw("clarity"),
    caratMin: asNumber("carat_min"),
    caratMax: asNumber("carat_max"),
  };
}

/**
 * Serialize filter state back to a query string suitable for history.replace.
 * Only defined, non-empty values are written so cleared filters vanish from
 * the URL instead of hanging around as `?cut=`.
 */
export function filtersToQueryString(filters: SearchFilters): string {
  const params = new URLSearchParams();
  if (filters.cut) params.set("cut", filters.cut);
  if (filters.color) params.set("color", filters.color);
  if (filters.clarity) params.set("clarity", filters.clarity);
  if (typeof filters.caratMin === "number" && !Number.isNaN(filters.caratMin))
    params.set("carat_min", String(filters.caratMin));
  if (typeof filters.caratMax === "number" && !Number.isNaN(filters.caratMax))
    params.set("carat_max", String(filters.caratMax));
  return params.toString();
}

function normalizeString(v: string | undefined): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim().toLowerCase();
  return t === "" ? undefined : t;
}

function numberOrUndefined(v: number | undefined): number | undefined {
  if (typeof v !== "number" || Number.isNaN(v)) return undefined;
  return v;
}
