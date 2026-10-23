import type { Session } from "@/lib/auth";

export type SessionUser = NonNullable<Session>["user"];

export class AuthenticationError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor() {
    super("You are not allowed to perform this action");
    this.name = "AuthorizationError";
  }
}

/**
 * Returns the signed-in user or throws when there is no session.
 *
 * @param session Verified server session.
 * @returns The authenticated user.
 */
export function requireUser(session: Session | null): SessionUser {
  if (!session) {
    throw new AuthenticationError();
  }

  return session.user;
}

/**
 * Checks whether the actor owns the shop.
 *
 * @param userId Authenticated user ID from the server session.
 * @param ownerUserId Shop owner ID loaded from the database.
 * @returns True when both IDs match.
 */
export function isShopOwner(userId: string, ownerUserId: string) {
  return userId === ownerUserId;
}

/**
 * Throws unless the authenticated user owns the shop.
 *
 * @param userId Authenticated user ID from the server session.
 * @param ownerUserId Shop owner ID loaded from the database.
 */
export function requireShopOwner(userId: string, ownerUserId: string) {
  if (!isShopOwner(userId, ownerUserId)) {
    throw new AuthorizationError();
  }
}

/**
 * Checks for the platform-admin role. Better Auth stores multiple roles as a
 * comma-separated string, so check each entry rather than comparing the whole
 * value.
 */
export function isAdmin(user: { role?: string | null }) {
  return user.role?.split(",").some((role) => role.trim() === "admin") ?? false;
}

/**
 * Throws unless the authenticated user is a platform admin. Shop ownership is
 * a separate check (`requireShopOwner`) and never grants admin access.
 *
 * @param session Verified server session.
 * @returns The authenticated admin user.
 */
export function requireAdmin(session: Session | null): SessionUser {
  const user = requireUser(session);

  if (!isAdmin(user)) {
    throw new AuthorizationError();
  }

  return user;
}
