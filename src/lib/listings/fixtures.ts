import type { Listing } from "./types";

/**
 * Pre-launch listing fixtures.
 *
 * Five stones chosen to exercise the catalog UI states:
 *   - verified cert + images (the common case)
 *   - pending cert + images (amber badge)
 *   - verified cert + NO images (drives the "Imagery pending" indicator)
 *
 * Cert numbers use plausible GIA (10-digit numeric) / AGS (AGS + digits)
 * shapes so `detectCertLab` in `src/lib/certifications/parse` would classify
 * them correctly if a lookup were run.
 */
export const listings: Listing[] = [
  {
    id: "diamond-round-e-vs1-1ct",
    name: "1.00 ct Round Brilliant, E VS1",
    shape: "Round",
    carat: 1.0,
    color: "E",
    clarity: "VS1",
    cutGrade: "Excellent",
    priceUsd: 8250,
    images: ["/listings/round-e-vs1-1ct-front.jpg"],
    cert: {
      lab: "GIA",
      number: "1234567890",
      status: "verified",
    },
  },
  {
    id: "diamond-oval-f-vs2-1_5ct",
    name: "1.50 ct Oval, F VS2",
    shape: "Oval",
    carat: 1.5,
    color: "F",
    clarity: "VS2",
    cutGrade: "Excellent",
    priceUsd: 12400,
    images: [
      "/listings/oval-f-vs2-1_5ct-front.jpg",
      "/listings/oval-f-vs2-1_5ct-side.jpg",
    ],
    cert: {
      lab: "GIA",
      number: "2233445566",
      status: "verified",
    },
  },
  {
    id: "diamond-cushion-g-vs1-2ct",
    name: "2.01 ct Cushion, G VS1",
    shape: "Cushion",
    carat: 2.01,
    color: "G",
    clarity: "VS1",
    cutGrade: "Very Good",
    priceUsd: 18900,
    images: ["/listings/cushion-g-vs1-2ct-front.jpg"],
    cert: {
      lab: "AGS",
      number: "AGS10420193",
      status: "pending",
    },
  },
  {
    id: "diamond-emerald-d-vvs2-0_75ct",
    name: "0.75 ct Emerald, D VVS2",
    shape: "Emerald",
    carat: 0.75,
    color: "D",
    clarity: "VVS2",
    cutGrade: "Excellent",
    priceUsd: 6300,
    // Intentionally empty — exercises the "Imagery pending" fallback.
    images: [],
    cert: {
      lab: "GIA",
      number: "3344556677",
      status: "verified",
    },
  },
  {
    id: "diamond-princess-e-vs2-1_25ct",
    name: "1.25 ct Princess, E VS2",
    shape: "Princess",
    carat: 1.25,
    color: "E",
    clarity: "VS2",
    cutGrade: "Excellent",
    priceUsd: 9100,
    images: ["/listings/princess-e-vs2-1_25ct-front.jpg"],
    cert: {
      lab: "AGS",
      number: "AGS10420194",
      status: "verified",
    },
  },
];
