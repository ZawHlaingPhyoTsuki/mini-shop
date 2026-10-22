import { describe, expect, it } from "vitest";

import { AuthorizationError, isShopOwner, requireShopOwner } from "./authz";

describe("shop authorization", () => {
  it("allows only the shop owner", () => {
    expect(isShopOwner("user-1", "user-1")).toBe(true);
    expect(isShopOwner("user-1", "user-2")).toBe(false);
  });

  it("throws for a non-owner", () => {
    expect(() => requireShopOwner("user-1", "user-2")).toThrow(AuthorizationError);
    expect(() => requireShopOwner("user-1", "user-1")).not.toThrow();
  });
});
