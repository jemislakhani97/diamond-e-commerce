import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import SearchPage from "../page";

describe("/search result cards", () => {
  const html = renderToStaticMarkup(<SearchPage />);

  it("renders at least one card link to /listings/[id]", () => {
    const hrefs = Array.from(
      html.matchAll(/href="(\/listings\/[A-Za-z0-9_-]+)"/g),
    ).map((m) => m[1]);
    expect(hrefs.length).toBeGreaterThan(0);
  });

  it("every rendered result card is wrapped in a Link to a /listings/[id] route", () => {
    // Extract the results grid section by its aria-label, then count cards vs hrefs inside it.
    const grid = html.match(
      /<section[^>]*aria-label="Search results"[^>]*>([\s\S]*?)<\/section>/,
    );
    expect(grid).not.toBeNull();
    const gridHtml = grid![1];

    const articleCount = (gridHtml.match(/<article\b/g) ?? []).length;
    const linkHrefs = Array.from(
      gridHtml.matchAll(/href="(\/listings\/[A-Za-z0-9_-]+)"/g),
    ).map((m) => m[1]);

    expect(articleCount).toBeGreaterThan(0);
    // Each card article has a wrapping link with a /listings/[id] href.
    expect(linkHrefs.length).toBe(articleCount);
    // Every href matches the expected pattern with a non-empty id segment.
    for (const href of linkHrefs) {
      expect(href).toMatch(/^\/listings\/[A-Za-z0-9_-]+$/);
    }
    // Ids are unique across the grid.
    expect(new Set(linkHrefs).size).toBe(linkHrefs.length);
  });
});
