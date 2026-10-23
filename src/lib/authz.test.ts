import { describe, expect, it } from "vitest";

import type { Session } from "@/lib/auth";

import {
  AuthenticationError,
  AuthorizationError,
  isAdmin,
  isShopOwner,
  requireAdmin,
  requireShopOwner,
} from "./authz";

const sessionFor = (role: string) => ({ user: { role } }) as unknown as Session;

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

describe("admin authorization", () => {
  it("recognizes admins among comma-separated roles", () => {
    expect(isAdmin({ role: "admin" })).toBe(true);
    expect(isAdmin({ role: "customer, admin" })).toBe(true);
    expect(isAdmin({ role: "customer" })).toBe(false);
    expect(isAdmin({ role: "shop-owner" })).toBe(false);
    expect(isAdmin({ role: null })).toBe(false);
  });

  it("does not grant admin access to shop owners", () => {
    expect(() => requireAdmin(sessionFor("shop-owner"))).toThrow(AuthorizationError);
  });

  it("requires an authenticated admin session", () => {
    expect(requireAdmin(sessionFor("admin")).role).toBe("admin");
    expect(() => requireAdmin(sessionFor("customer"))).toThrow(AuthorizationError);
    expect(() => requireAdmin(null)).toThrow(AuthenticationError);
  });
});
