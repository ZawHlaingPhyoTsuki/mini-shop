import { z } from "zod";

export const SHOP_STATUSES = ["DRAFT", "PENDING_REVIEW", "ACTIVE", "SUSPENDED", "CLOSED"] as const;

export const shopStatusSchema = z.enum(SHOP_STATUSES);

export type ShopStatus = z.infer<typeof shopStatusSchema>;

/**
 * Allowed shop-status changes. Owners may submit or resubmit for review; only
 * an admin review may activate a shop.
 */
export const SHOP_TRANSITIONS = {
  DRAFT: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["ACTIVE", "DRAFT"],
  ACTIVE: [],
  SUSPENDED: [],
  CLOSED: [],
} as const satisfies Record<ShopStatus, readonly ShopStatus[]>;

/**
 * Checks whether a shop-status change is allowed.
 *
 * @param from Current status.
 * @param to Requested next status.
 * @returns True when the transition exists in the lifecycle table.
 */
export function canTransition(from: ShopStatus, to: ShopStatus) {
  return (SHOP_TRANSITIONS[from] as readonly ShopStatus[]).includes(to);
}

/**
 * Throws unless the shop-status change is allowed.
 *
 * @param from Current status.
 * @param to Requested next status.
 */
export function assertTransition(from: ShopStatus, to: ShopStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid shop transition: ${from} -> ${to}`);
  }
}
