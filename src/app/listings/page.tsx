import type { Metadata } from "next";
import { listings } from "@/lib/listings/fixtures";
import { ListingsCatalog } from "./ListingsCatalog";

export const metadata: Metadata = {
  title: "Browse certified diamonds — Diamond Marketplace",
  description:
    "Browse the pre-launch catalog. Every diamond GIA or AGS graded, side-by-side 4Cs, escrow-protected checkout.",
};

export default function ListingsIndexPage() {
  return <ListingsCatalog listings={listings} />;
}
