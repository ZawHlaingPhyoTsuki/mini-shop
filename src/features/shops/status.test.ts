import { describe, expect, it } from "vitest";

import { assertTransition, canTransition } from "./status";

describe("shop status transitions", () => {
  it("lets an owner submit and resubmit a shop", () => {
    expect(canTransition("DRAFT", "PENDING_REVIEW")).toBe(true);
  });

  it("only lets a review activate a shop", () => {
    expect(canTransition("PENDING_REVIEW", "ACTIVE")).toBe(true);
    expect(canTransition("PENDING_REVIEW", "DRAFT")).toBe(true);
    expect(canTransition("DRAFT", "ACTIVE")).toBe(false);
  });

  it("rejects skipped and terminal transitions", () => {
    expect(canTransition("ACTIVE", "PENDING_REVIEW")).toBe(false);
    expect(() => assertTransition("ACTIVE", "DRAFT")).toThrow("Invalid shop transition");
  });
});
