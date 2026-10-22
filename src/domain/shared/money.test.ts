import { describe, expect, it } from "vitest";

import { formatMoney, moneySchema } from "./money";

describe("money", () => {
  it("accepts whole units for MMK and THB", () => {
    expect(moneySchema.safeParse({ amount: 1500, currency: "MMK" }).success).toBe(true);
    expect(moneySchema.safeParse({ amount: 1234, currency: "THB" }).success).toBe(true);
  });

  it("rejects fractional amounts and unsupported currencies", () => {
    expect(moneySchema.safeParse({ amount: 10.5, currency: "MMK" }).success).toBe(false);
    expect(moneySchema.safeParse({ amount: 12.34, currency: "THB" }).success).toBe(false);
    expect(moneySchema.safeParse({ amount: 100, currency: "USD" }).success).toBe(false);
  });

  it("formats both currencies without decimals", () => {
    expect(formatMoney({ amount: 1500, currency: "MMK" })).toContain("1,500");
    expect(formatMoney({ amount: 1234, currency: "THB" })).toContain("1,234");
    expect(formatMoney({ amount: 1234, currency: "THB" })).not.toContain(".");
  });
});
