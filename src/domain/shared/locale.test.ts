import { describe, expect, it } from "vitest";

import { localizedName, localizedNamesSchema } from "./locale";

describe("localized names", () => {
  it("requires English and allows other locales", () => {
    expect(localizedNamesSchema.safeParse({ my: "ဖက်ရှင်" }).success).toBe(false);
    expect(localizedNamesSchema.parse({ en: "Fashion", my: "ဖက်ရှင်" })).toEqual({
      en: "Fashion",
      my: "ဖက်ရှင်",
    });
  });

  it("falls back to English when the requested locale is missing", () => {
    expect(localizedName({ en: "Fashion" }, "my")).toBe("Fashion");
    expect(localizedName({ en: "Fashion", my: "ဖက်ရှင်" }, "my")).toBe("ဖက်ရှင်");
  });
});
