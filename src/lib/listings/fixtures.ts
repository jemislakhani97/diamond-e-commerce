import type { Listing } from "./types";

/**
 * Pre-launch fixture inventory.
 *
 * Covers the states the checkout gate cares about:
 *   - verified + imaged   (LST-1001, LST-1002, LST-1003)  → purchasable
 *   - verified + no image (LST-1004)                       → gated (imagery pending)
 *   - pending cert        (LST-1005)                       → gated (cert pending)
 *   - mismatch cert       (LST-1006)                       → gated (cert mismatch)
 */
export const LISTINGS: Listing[] = [
  {
    id: "LST-1001",
    name: "1.02 ct Round",
    shape: "Round",
    carat: 1.02,
    color: "D",
    clarity: "VVS1",
    cutGrade: "Excellent",
    origin: "natural",
    price_cents: 824000,
    currency: "usd",
    cert_status: "verified",
    cert_number: "1234567890",
    lab: "GIA",
    images: ["/listings/lst-1001-a.jpg", "/listings/lst-1001-b.jpg"],
    description:
      "Round brilliant with excellent symmetry and polish. GIA graded D VVS1.",
  },
  {
    id: "LST-1002",
    name: "1.51 ct Oval",
    shape: "Oval",
    carat: 1.51,
    color: "E",
    clarity: "VVS2",
    cutGrade: "Very Good",
    origin: "natural",
    price_cents: 1190000,
    currency: "usd",
    cert_status: "verified",
    cert_number: "22334455667",
    lab: "GIA",
    images: ["/listings/lst-1002-a.jpg"],
    description: "Oval brilliant, elongated ratio. GIA graded E VVS2.",
  },
  {
    id: "LST-1003",
    name: "0.91 ct Cushion",
    shape: "Cushion",
    carat: 0.91,
    color: "F",
    clarity: "VS1",
    cutGrade: "Excellent",
    origin: "natural",
    price_cents: 541000,
    currency: "usd",
    cert_status: "verified",
    cert_number: "AGS10420193",
    lab: "AGS",
    images: ["/listings/lst-1003-a.jpg"],
    description: "AGS graded cushion with excellent light performance.",
  },
  {
    id: "LST-1004",
    name: "2.03 ct Emerald (imagery pending)",
    shape: "Emerald",
    carat: 2.03,
    color: "D",
    clarity: "IF",
    cutGrade: "Excellent",
    origin: "lab-grown",
    price_cents: 988000,
    currency: "usd",
    cert_status: "verified",
    cert_number: "GIA-EM-88123",
    lab: "GIA",
    images: [],
    description:
      "Lab-grown emerald step-cut. Cert on file; high-res imagery arriving from the seller.",
  },
  {
    id: "LST-1005",
    name: "1.20 ct Round (cert pending)",
    shape: "Round",
    carat: 1.2,
    color: "E",
    clarity: "VVS1",
    cutGrade: "Excellent",
    origin: "natural",
    price_cents: 1015000,
    currency: "usd",
    cert_status: "pending",
    cert_number: "GIA-PEND-4471",
    lab: "GIA",
    images: ["/listings/lst-1005-a.jpg"],
    description: "Awaiting GIA report confirmation before offer.",
  },
  {
    id: "LST-1006",
    name: "1.75 ct Pear (cert mismatch)",
    shape: "Pear",
    carat: 1.75,
    color: "F",
    clarity: "VS2",
    cutGrade: "Very Good",
    origin: "natural",
    price_cents: 732000,
    currency: "usd",
    cert_status: "mismatch",
    cert_number: "GIA-MM-9020",
    lab: "GIA",
    images: ["/listings/lst-1006-a.jpg"],
    description: "Report dimensions do not match listed dimensions. Under review.",
  },
];

export function findListing(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}
