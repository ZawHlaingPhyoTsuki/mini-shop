import { describe, expect, it } from "vitest";

import { buildPlaceSlug, slugifyPlaceName } from "./places-slug";

describe("slugifyPlaceName", () => {
  it("lowercases and hyphenates a plain name", () => {
    expect(slugifyPlaceName("Mekong Riverside Restaurant")).toBe("mekong-riverside-restaurant");
  });

  it("strips punctuation and collapses separators", () => {
    expect(slugifyPlaceName("  Shan Noodle Shop!! (San Sai) ")).toBe("shan-noodle-shop-san-sai");
  });

  it("transliterates diacritics to ascii", () => {
    expect(slugifyPlaceName("Café Latté")).toBe("cafe-latte");
  });

  it("returns null for empty or punctuation-only input", () => {
    expect(slugifyPlaceName("")).toBeNull();
    expect(slugifyPlaceName("   ")).toBeNull();
    expect(slugifyPlaceName("!!!")).toBeNull();
  });

  it("truncates very long names without trailing hyphens", () => {
    const slug = slugifyPlaceName(`${"a".repeat(40)} ${"b".repeat(40)}`);
    expect(slug).not.toBeNull();
    expect(slug!.length).toBeLessThanOrEqual(60);
    expect(slug).not.toMatch(/-$/);
  });
});

describe("buildPlaceSlug", () => {
  it("falls back to place- plus a 6-char id when nameEn is missing", () => {
    expect(buildPlaceSlug({})).toMatch(/^place-[a-z0-9]{6}$/);
    expect(buildPlaceSlug({ nameEn: "   " })).toMatch(/^place-[a-z0-9]{6}$/);
    expect(buildPlaceSlug({ nameEn: "!!!" })).toMatch(/^place-[a-z0-9]{6}$/);
  });

  it("appends -2, -3 on collision", () => {
    expect(buildPlaceSlug({ nameEn: "Shan Noodle", taken: ["shan-noodle"] })).toBe("shan-noodle-2");
    expect(buildPlaceSlug({ nameEn: "Shan Noodle", taken: ["shan-noodle", "shan-noodle-2"] })).toBe(
      "shan-noodle-3",
    );
  });

  it("suffices a taken fallback instead of looping randomly", () => {
    expect(buildPlaceSlug({ taken: ["place-abc123"], fallbackId: "abc123" })).toBe(
      "place-abc123-2",
    );
  });
});
