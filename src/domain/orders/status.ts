import { z } from "zod";

export const FULFILLMENT_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "rejected",
  "cancelled",
  "delivery_failed",
  "returned",
] as const;

export const fulfillmentStatusSchema = z.enum(FULFILLMENT_STATUSES);

export type FulfillmentStatus = z.infer<typeof fulfillmentStatusSchema>;

export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;

export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const FULFILLMENT_TRANSITIONS = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "delivery_failed"],
  delivered: ["returned"],
  rejected: [],
  cancelled: [],
  delivery_failed: ["shipped"],
  returned: [],
} as const satisfies Record<FulfillmentStatus, readonly FulfillmentStatus[]>;

/**
 * Checks whether a fulfillment status change is allowed.
 *
 * @param from Current status.
 * @param to Requested next status.
 * @returns True when the transition exists in the lifecycle table.
 */
export function canTransition(from: FulfillmentStatus, to: FulfillmentStatus) {
  return (FULFILLMENT_TRANSITIONS[from] as readonly FulfillmentStatus[]).includes(to);
}

/**
 * Throws unless the fulfillment status change is allowed.
 *
 * @param from Current status.
 * @param to Requested next status.
 */
export function assertTransition(from: FulfillmentStatus, to: FulfillmentStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid fulfillment transition: ${from} -> ${to}`);
  }
}
