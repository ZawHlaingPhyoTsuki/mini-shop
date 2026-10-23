import { describe, expect, it } from "vitest";

import { createPlaceSchema } from "./places.schemas.js";

const base = { nameMy: "Test Place", categoryId: "cat1" };

describe("createPlaceSchema", () => {
  it("accepts coordinates as a pair or neither", () => {
    expect(createPlaceSchema.safeParse({ ...base, latitude: 20.4, longitude: 99.8 }).success).toBe(
      true,
    );
    expect(createPlaceSchema.safeParse(base).success).toBe(true);
    expect(createPlaceSchema.safeParse({ ...base, latitude: null, longitude: null }).success).toBe(
      true,
    );

    const latOnly = createPlaceSchema.safeParse({ ...base, latitude: 20.4 });
    expect(latOnly.success).toBe(false);
    if (!latOnly.success) {
      expect(latOnly.error.issues[0]?.message).toBe("Set both latitude and longitude, or neither");
    }
    expect(createPlaceSchema.safeParse({ ...base, longitude: 99.8 }).success).toBe(false);
  });

  it("normalises the telegram handle by stripping leading @", () => {
    const parsed = createPlaceSchema.parse({ ...base, telegramHandle: "@tclguide" });
    expect(parsed.telegramHandle).toBe("tclguide");
  });

  it("rejects bad facebook URLs with a single error", () => {
    for (const facebookUrl of ["http://facebook.com/x", "facebook.com/x", "not a url"]) {
      const parsed = createPlaceSchema.safeParse({ ...base, facebookUrl });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        const issues = parsed.error.issues.filter((issue) => issue.path.includes("facebookUrl"));
        expect(issues).toHaveLength(1);
        expect(issues[0]?.message).toBe("Enter a valid Facebook URL starting with https://");
      }
    }
    expect(
      createPlaceSchema.safeParse({ ...base, facebookUrl: "https://facebook.com/x" }).success,
    ).toBe(true);
  });

  it("rejects tags outside the fixed vocabulary", () => {
    expect(createPlaceSchema.safeParse({ ...base, tags: ["halal", "delivery"] }).success).toBe(
      true,
    );
    expect(createPlaceSchema.safeParse({ ...base, tags: ["noodles"] }).success).toBe(false);
  });
});
