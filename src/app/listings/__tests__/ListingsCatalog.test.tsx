import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ListingsCatalog } from "../ListingsCatalog";
import { listings } from "@/lib/listings/fixtures";
import type { Listing } from "@/lib/listings/types";

function render(l: readonly Listing[]): string {
  return renderToStaticMarkup(<ListingsCatalog listings={l} />);
}

describe("<ListingsCatalog /> — catalog browse", () => {
  it("renders one card per fixture with name, carat, and 4C summary visible", () => {
    const html = render(listings);

    // Card count matches fixture count.
    const cardCount = (html.match(/data-testid="listing-card"/g) ?? []).length;
    expect(cardCount).toBe(listings.length);

    for (const l of listings) {
      expect(html).toContain(l.name);
      expect(html).toContain(`${l.carat.toFixed(2)} ct`);
      // 4C summary line — cut + color + clarity should all appear.
      expect(html).toContain(`${l.cutGrade} cut`);
      expect(html).toContain(`${l.color} color`);
      expect(html).toContain(`${l.clarity} clarity`);
    }
  });

  it("each card links to /listings/[id] with the correct fixture id", () => {
    const html = render(listings);
    for (const l of listings) {
      expect(html).toContain(`href="/listings/${l.id}"`);
    }
  });

  it("fixture with empty images shows the 'Imagery pending' indicator (no <img> tag)", () => {
    const withoutImages = listings.filter((l) => l.images.length === 0);
    expect(withoutImages.length).toBeGreaterThanOrEqual(1);
    const html = render(withoutImages);

    expect(html).toContain("Imagery pending");
    expect(html).toContain('data-testid="imagery-pending"');
    // No <img> element should be emitted anywhere in the DOM.
    expect(html).not.toMatch(/<img\b/i);
  });

  it("empty inventory renders the placeholder, not a blank grid", () => {
    const html = render([]);
    expect(html).toContain('data-testid="listings-empty"');
    expect(html).toContain("Inventory arriving soon");
    // No card grid at all when list is empty.
    expect(html).not.toContain('data-testid="listings-grid"');
    expect(html).not.toContain('data-testid="listing-card"');
  });

  it("guards against a listing with undefined images (does not throw)", () => {
    // Simulates a bad-shape listing that slipped past the type — the render
    // must not throw and must fall back to the imagery-pending indicator.
    const bad: Listing = {
      ...listings[0],
      id: "guard-null-images",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      images: undefined as unknown as any[],
    };
    expect(() => render([bad])).not.toThrow();
    const html = render([bad]);
    expect(html).toContain("Imagery pending");
  });

  it("renders the pending-cert badge for a fixture whose cert is pending", () => {
    const pending = listings.filter((l) => l.cert.status === "pending");
    expect(pending.length).toBeGreaterThanOrEqual(1);
    const html = render(pending);
    // CertBadge uses the "Pending" label + amber palette classes.
    expect(html).toContain("Pending");
    expect(html).toMatch(/bg-amber-50/);
  });
});
