import { describe, expect, it } from "vitest";
import { LISTINGS } from "@/lib/listings/fixtures";
import {
  filterListings,
  filtersToQueryString,
  parseFiltersFromParams,
  validateFilters,
} from "@/lib/search/filter";

describe("filterListings", () => {
  it("returns every fixture when no filters are set", () => {
    expect(filterListings(LISTINGS, {})).toHaveLength(LISTINGS.length);
  });

  it("treats undefined and empty-string filters as unset (no narrowing)", () => {
    const result = filterListings(LISTINGS, {
      cut: undefined,
      color: "",
      clarity: undefined,
    });
    expect(result).toHaveLength(LISTINGS.length);
  });

  it("single cut filter narrows to matching fixtures only", () => {
    const result = filterListings(LISTINGS, { cut: "Excellent" });
    const expected = LISTINGS.filter((l) => l.cut === "Excellent");
    expect(result).toHaveLength(expected.length);
    expect(result.every((l) => l.cut === "Excellent")).toBe(true);
    // AC2: must include ONLY matching fixtures, none of the others.
    expect(result.some((l) => l.cut !== "Excellent")).toBe(false);
  });

  it("cut filter is case-insensitive against the fixture value", () => {
    const lower = filterListings(LISTINGS, { cut: "excellent" });
    const canonical = filterListings(LISTINGS, { cut: "Excellent" });
    expect(lower.map((l) => l.id)).toEqual(canonical.map((l) => l.id));
  });

  it("single color filter narrows to matching color grade", () => {
    const result = filterListings(LISTINGS, { color: "D" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((l) => l.color === "D")).toBe(true);
  });

  it("single clarity filter narrows to matching clarity grade", () => {
    const result = filterListings(LISTINGS, { clarity: "VVS1" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((l) => l.clarity === "VVS1")).toBe(true);
  });

  it("no-match filter state returns the empty array (page shows empty state)", () => {
    // AC edge: a value matching no fixture must not be silently ignored.
    const result = filterListings(LISTINGS, { color: "Z" });
    expect(result).toEqual([]);
  });

  it("carat min/max is an inclusive band", () => {
    const target = LISTINGS.find((l) => l.carat === 1.02);
    expect(target).toBeDefined();
    const result = filterListings(LISTINGS, { caratMin: 1.02, caratMax: 1.02 });
    expect(result).toContainEqual(target);
  });

  it("carat min alone excludes lighter stones", () => {
    const result = filterListings(LISTINGS, { caratMin: 1.5 });
    expect(result.every((l) => l.carat >= 1.5)).toBe(true);
    expect(result.length).toBeLessThan(LISTINGS.length);
  });

  it("carat max alone excludes heavier stones", () => {
    const result = filterListings(LISTINGS, { caratMax: 1.0 });
    expect(result.every((l) => l.carat <= 1.0)).toBe(true);
    expect(result.length).toBeLessThan(LISTINGS.length);
  });

  it("all four filters compose as AND", () => {
    const result = filterListings(LISTINGS, {
      cut: "Excellent",
      color: "D",
      clarity: "VVS1",
      caratMin: 1,
      caratMax: 1.5,
    });
    expect(result.every((l) =>
      l.cut === "Excellent" &&
      l.color === "D" &&
      l.clarity === "VVS1" &&
      l.carat >= 1 &&
      l.carat <= 1.5,
    )).toBe(true);
  });

  it("carat min > max: returns empty AND surfaces caratRangeInvalid", () => {
    const filters = { caratMin: 2, caratMax: 1 };
    expect(filterListings(LISTINGS, filters)).toEqual([]);
    const v = validateFilters(filters);
    expect(v.ok).toBe(false);
    expect(v.caratRangeInvalid).toBe(true);
  });

  it("carat min == max is valid (single-value band)", () => {
    const v = validateFilters({ caratMin: 1.02, caratMax: 1.02 });
    expect(v.ok).toBe(true);
    expect(v.caratRangeInvalid).toBe(false);
  });
});

describe("parseFiltersFromParams", () => {
  it("reads all four filters and coerces numeric carat bounds", () => {
    const params = new URLSearchParams(
      "cut=Excellent&color=D&clarity=VVS1&carat_min=0.5&carat_max=2",
    );
    expect(parseFiltersFromParams(params)).toEqual({
      cut: "Excellent",
      color: "D",
      clarity: "VVS1",
      caratMin: 0.5,
      caratMax: 2,
    });
  });

  it("drops empty-string params so a hanging `?cut=` doesn't lock out results", () => {
    const params = new URLSearchParams("cut=&color=D");
    expect(parseFiltersFromParams(params)).toEqual({
      cut: undefined,
      color: "D",
      clarity: undefined,
      caratMin: undefined,
      caratMax: undefined,
    });
  });

  it("drops non-numeric carat bounds instead of throwing", () => {
    const params = new URLSearchParams("carat_min=abc&carat_max=nan");
    const parsed = parseFiltersFromParams(params);
    expect(parsed.caratMin).toBeUndefined();
    expect(parsed.caratMax).toBeUndefined();
  });
});

describe("filtersToQueryString", () => {
  it("omits undefined/empty values so cleared filters vanish from the URL", () => {
    expect(filtersToQueryString({})).toBe("");
    expect(
      filtersToQueryString({ cut: "Excellent", color: undefined, clarity: "" }),
    ).toBe("cut=Excellent");
  });

  it("round-trips a full filter set", () => {
    const filters = {
      cut: "Excellent",
      color: "D",
      clarity: "VVS1",
      caratMin: 0.5,
      caratMax: 2,
    };
    const qs = filtersToQueryString(filters);
    const parsed = parseFiltersFromParams(new URLSearchParams(qs));
    expect(parsed).toEqual(filters);
  });
});
