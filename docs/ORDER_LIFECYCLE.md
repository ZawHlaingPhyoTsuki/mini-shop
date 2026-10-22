# Order Lifecycle

## 1. Principles

- The MVP supports cash on delivery (COD) only.
- One checkout contains items from one shop.
- Order fulfillment and payment are separate concepts.
- The server calculates all totals in one explicit currency (`MMK` or `THB`).
- The order stores immutable item snapshots.
- Every status change is authorized and validated server-side.

## 2. Suggested fulfillment statuses

- `pending` — order was submitted and awaits merchant action.
- `confirmed` — merchant accepted the order.
- `processing` — merchant is preparing the order.
- `shipped` — order has been handed to a delivery service or is on the way.
- `delivered` — customer received the order.
- `rejected` — merchant rejected the order.
- `cancelled` — order was cancelled according to policy.
- `delivery_failed` — delivery could not be completed.
- `returned` — an order was returned after shipment/delivery according to the agreed policy.

Use a narrower enum if the first implementation does not support every state. Do not expose transitions the product cannot actually handle.

## 3. Suggested payment statuses

- `unpaid` — COD payment has not been confirmed.
- `paid` — payment was reported as collected.
- `refunded` — only relevant if a refund process is later introduced.

The exact set may be simplified for COD. A delivered order should not automatically be treated as paid unless the workflow has an explicit collection confirmation.

## 4. Allowed transitions

Suggested transitions:

| Current           | Next              | Actor / condition                                     |
| ----------------- | ----------------- | ----------------------------------------------------- |
| `pending`         | `confirmed`       | Authorized merchant                                   |
| `pending`         | `rejected`        | Authorized merchant                                   |
| `pending`         | `cancelled`       | Customer, if cancellation policy allows               |
| `confirmed`       | `processing`      | Authorized merchant                                   |
| `confirmed`       | `cancelled`       | Authorized actor under policy                         |
| `processing`      | `shipped`         | Authorized merchant                                   |
| `processing`      | `cancelled`       | Only if not yet handed to delivery and policy permits |
| `shipped`         | `delivered`       | Authorized fulfillment actor or merchant confirmation |
| `shipped`         | `delivery_failed` | Authorized fulfillment actor or merchant confirmation |
| `delivery_failed` | `shipped`         | Retry permitted by policy                             |
| `delivered`       | `returned`        | Only if returns are supported and policy permits      |

These are proposed rules. Finalize the customer cancellation window, stock release policy, and delivery-failure handling before implementation.

## 5. Order creation

At checkout, the server must:

1. Validate customer input.
2. Resolve the selected shop and ensure it is eligible to sell.
3. Load products and variants from the database.
4. Ensure every item belongs to the same shop.
5. Ensure products are published and purchasable.
6. Validate quantities and inventory.
7. Calculate unit prices, subtotal, delivery fee, and total in the listing currency.
8. Create the order and item snapshots in a transaction.
9. Apply the selected stock reservation/decrement policy atomically.
10. Return a safe order reference and confirmation details.

Do not accept client-provided totals as authoritative.

## 6. Duplicate submission and idempotency

Network retries and double-clicks can submit the same order more than once. Use a safe idempotency strategy where practical, such as a unique checkout request token tied to the intended customer/session. Do not use an easily guessable order ID as a secret.

## 7. Order history and privacy

- Customers may view only their own orders, including guest orders after suitable verification.
- Merchants may view orders for shops they manage.
- Public order tracking must not expose full customer details.
- Avoid putting phone numbers or addresses in URLs.
- Do not expose sequential internal IDs as public order references.

## 8. Inventory and cancellation

Choose one policy before implementation. If stock is reserved/decremented at order placement, release it on rejection, cancellation, or reservation expiry as appropriate. If stock is changed at confirmation, the merchant may need to reject an order if inventory has already sold out.

All stock updates must be concurrency-safe. Test two simultaneous orders for the last item.
