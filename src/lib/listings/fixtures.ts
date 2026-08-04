import type { Listing } from "./types";

/**
 * Pre-launch fixture inventory for the buyer-facing /search page.
 *
 * The three GIA/AGS cert numbers below match the FIXTURE_REPORTS in
 * `src/lib/certifications/lookup.ts` so that a listing card and a cert lookup
 * agree on the underlying stone. Additional fixtures cover the other filter
 * axes (colors D-H, clarities FL-VS2, cuts Excellent/Very Good/Good) so any
 * single-field filter narrows to a defined subset the tests can assert on.
 */
export const LISTINGS: Listing[] = [
  {
    id: "dm-0001",
    name: "1.02 ct Round Brilliant",
    shape: "Round",
    carat: 1.02,
    cut: "Excellent",
    color: "D",
    clarity: "VVS1",
    lab: "GIA",
    certNumber: "1234567890",
    status: "verified",
    priceUsd: 8240,
    origin: "natural",
  },
  {
    id: "dm-0002",
    name: "1.51 ct Oval",
    shape: "Oval",
    carat: 1.51,
    cut: "Very Good",
    color: "E",
    clarity: "VVS2",
    lab: "GIA",
    certNumber: "22334455667",
    status: "verified",
    priceUsd: 11900,
    origin: "natural",
  },
  {
    id: "dm-0003",
    name: "0.91 ct Cushion",
    shape: "Cushion",
    carat: 0.91,
    cut: "Excellent",
    color: "F",
    clarity: "VS1",
    lab: "AGS",
    certNumber: "AGS10420193",
    status: "verified",
    priceUsd: 5410,
    origin: "natural",
  },
  {
    id: "dm-0004",
    name: "2.03 ct Emerald",
    shape: "Emerald",
    carat: 2.03,
    cut: "Excellent",
    color: "D",
    clarity: "IF",
    lab: "GIA",
    certNumber: "5511223344",
    status: "verified",
    priceUsd: 9880,
    origin: "lab-grown",
  },
  {
    id: "dm-0005",
    name: "1.20 ct Round",
    shape: "Round",
    carat: 1.2,
    cut: "Excellent",
    color: "E",
    clarity: "VVS1",
    lab: "GIA",
    certNumber: "7788990011",
    status: "pending",
    priceUsd: 10150,
    origin: "natural",
  },
  {
    id: "dm-0006",
    name: "1.75 ct Pear",
    shape: "Pear",
    carat: 1.75,
    cut: "Very Good",
    color: "F",
    clarity: "VS2",
    lab: "GIA",
    certNumber: "3344556677",
    status: "verified",
    priceUsd: 7320,
    origin: "natural",
  },
  {
    id: "dm-0007",
    name: "0.75 ct Princess",
    shape: "Princess",
    carat: 0.75,
    cut: "Good",
    color: "H",
    clarity: "VS2",
    lab: "AGS",
    certNumber: "AGS20033114",
    status: "verified",
    priceUsd: 2890,
    origin: "natural",
  },
  {
    id: "dm-0008",
    name: "1.10 ct Radiant",
    shape: "Radiant",
    carat: 1.1,
    cut: "Very Good",
    color: "G",
    clarity: "VS1",
    lab: "GIA",
    certNumber: "9911002233",
    status: "verified",
    priceUsd: 6180,
    origin: "lab-grown",
  },
];

/** Distinct cut grades represented in the fixture set, in display order. */
export const CUT_GRADES = ["Excellent", "Very Good", "Good", "Fair"] as const;

/** Distinct color grades represented in the fixture set, in display order. */
export const COLOR_GRADES = ["D", "E", "F", "G", "H"] as const;

/** Distinct clarity grades represented in the fixture set, in display order. */
export const CLARITY_GRADES = [
  "FL",
  "IF",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
  "SI2",
] as const;
