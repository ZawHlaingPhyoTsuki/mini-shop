import { describe, expect, it } from "vitest";

import { quantitySchema, slugSchema } from "./validation";

describe("shared validation", () => {
  it("normalizes valid slugs", () => {
    expect(slugSchema.parse("  Home-Living ")).toBe("home-living");
  });

  it("rejects unsafe slugs and invalid quantities", () => {
    expect(slugSchema.safeParse("home living").success).toBe(false);
    expect(slugSchema.safeParse("../home").success).toBe(false);
    expect(quantitySchema.safeParse(0).success).toBe(false);
    expect(quantitySchema.safeParse(2).success).toBe(true);
  });
});
