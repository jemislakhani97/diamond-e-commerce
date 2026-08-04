import { describe, expect, it } from "vitest";
import { listings } from "../fixtures";

describe("listings fixtures", () => {
  it("has at least 5 stones so the catalog grid renders multiple cards", () => {
    expect(listings.length).toBeGreaterThanOrEqual(5);
  });

  it("every fixture has a unique id", () => {
    const ids = listings.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every fixture has the fields the card renders (name, carat, 4C, cert)", () => {
    for (const l of listings) {
      expect(l.name).toBeTypeOf("string");
      expect(l.name.length).toBeGreaterThan(0);
      expect(l.carat).toBeGreaterThan(0);
      expect(l.color).toBeTypeOf("string");
      expect(l.clarity).toBeTypeOf("string");
      expect(l.cutGrade).toBeTypeOf("string");
      expect(l.cert.lab === "GIA" || l.cert.lab === "AGS").toBe(true);
      expect(l.cert.number.length).toBeGreaterThan(0);
      expect(Array.isArray(l.images)).toBe(true);
    }
  });

  it("includes at least one fixture with empty images (drives the imagery-pending branch)", () => {
    const noImages = listings.filter((l) => l.images.length === 0);
    expect(noImages.length).toBeGreaterThanOrEqual(1);
  });

  it("includes at least one fixture per cert badge status the browse page can show", () => {
    const statuses = new Set(listings.map((l) => l.cert.status));
    expect(statuses.has("verified")).toBe(true);
    expect(statuses.has("pending")).toBe(true);
  });
});
