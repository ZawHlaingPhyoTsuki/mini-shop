import { describe, expect, it } from "vitest";

import { assertTransition, canTransition } from "./status";

describe("order status transitions", () => {
  it("allows the COD fulfillment path", () => {
    expect(canTransition("pending", "confirmed")).toBe(true);
    expect(canTransition("confirmed", "processing")).toBe(true);
    expect(canTransition("processing", "shipped")).toBe(true);
    expect(canTransition("shipped", "delivered")).toBe(true);
  });

  it("rejects skipped and terminal transitions", () => {
    expect(canTransition("pending", "delivered")).toBe(false);
    expect(canTransition("cancelled", "confirmed")).toBe(false);
    expect(() => assertTransition("delivered", "pending")).toThrow(
      "Invalid fulfillment transition",
    );
  });
});
