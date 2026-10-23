import { describe, expect, it } from "vitest";
import { createShopSchema } from "./shops-schema";

describe("createShopSchema", () => {
  it("validates a correct shop input", () => {
    const valid = {
      name: "Cherry Blossom Boutique",
      slug: "cherry-blossom",
      descriptionEn: "Local social commerce boutique",
      contactPhone: "09123456789",
    };
    const result = createShopSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid shop slug", () => {
    const invalid = {
      name: "Cherry Blossom Boutique",
      slug: "Invalid Slug with Spaces",
    };
    const result = createShopSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
