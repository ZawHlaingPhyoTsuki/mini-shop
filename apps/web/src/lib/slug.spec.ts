import { describe, expect, it } from "vitest";
import { SLUG_PATTERN } from "./slug";

describe("SLUG_PATTERN", () => {
  it("accepts valid lowercase slugs", () => {
    expect(SLUG_PATTERN.test("cherry-blossom")).toBe(true);
    expect(SLUG_PATTERN.test("my_shop_123")).toBe(true);
    expect(SLUG_PATTERN.test("store")).toBe(true);
  });

  it("rejects uppercase and invalid characters", () => {
    expect(SLUG_PATTERN.test("Cherry-Blossom")).toBe(false);
    expect(SLUG_PATTERN.test("shop with space")).toBe(false);
    expect(SLUG_PATTERN.test("shop@special")).toBe(false);
    expect(SLUG_PATTERN.test("-leading-hyphen")).toBe(false);
    expect(SLUG_PATTERN.test("trailing-hyphen-")).toBe(false);
  });
});
