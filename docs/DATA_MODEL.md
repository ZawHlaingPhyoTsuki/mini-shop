# Data Model

This document describes the intended domain model. It is not a finalized Prisma schema. Match names and types to the conventions already present in `prisma/`.

## 1. Identity

### Better Auth tables

Use the tables required by the installed Better Auth configuration and Prisma adapter (`prisma/auth.prisma`). Keep these authentication records distinct from marketplace domain concepts.

### Shop membership

For the simplest MVP, each shop can have one owner referenced by `ownerUserId`. If collaboration is required, introduce `ShopMember` with `shopId`, `userId`, role, and membership status. Do not assume a user's session grants shop access.

## 2. Shop

Suggested fields:

- `id`
- `ownerUserId`
- `name`
- `slug` (unique)
- `description`
- `logoObjectKey` (nullable)
- `bannerObjectKey` (nullable)
- `contactPhone` (nullable)
- `socialLinks` (structured JSON or normalized table)
- `status` (`draft`, `pending_review`, `active`, `suspended`, `closed`)
- `createdAt`
- `updatedAt`

Rules:

- Slugs must be unique.
- Only authorized owners/members may edit the shop.
- Public storefronts require an eligible shop status.
- A suspended shop's products must not appear in public search.

## 3. Category

Implemented fields:

- `id`
- `names` (JSONB localized map; English required, Myanmar optional)
- `slug` (unique)
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

Example: `{ "en": "Fashion", "my": "ဖက်ရှင်" }`. English is the fallback
locale. Add Shan and other locales to the map later without adding columns.

Categories are administered by the platform, not freely created by every merchant in the initial MVP.

## 4. Product

Suggested fields:

- `id`
- `shopId`
- `categoryId`
- `names` (localized map, English required)
- `slug`
- `description`
- `priceAmount` (whole integer units for a simple fixed-price listing, or a minimum/starting price if variants can differ)
- `currency` (`MMK` or `THB`)
- `status` (`draft`, `published`, `archived`, `hidden`)
- `createdAt`
- `updatedAt`
- `publishedAt` (nullable)

Rules:

- Product slug uniqueness may be scoped to the shop; public routes should then use both shop slug and product slug, or use a globally unique public slug.
- Price must be a valid non-negative or positive integer according to the listing policy.
- Only active shop listings can be public.
- Product changes must not mutate historical order item snapshots.

## 5. Product images

Suggested `ProductImage` fields:

- `id`
- `productId`
- `objectKey`
- `altText`
- `sortOrder`
- `createdAt`

Store object keys rather than binary image data or long-lived signed URLs. Product images use the `public_read` `assets` bucket; serve them from the bucket endpoint or a CDN in front of it.

## 6. Product variants and inventory

For products requiring variants, use `ProductVariant`:

- `id`
- `productId`
- localized name map or structured option values (e.g. `Black / M`)
- `sku` (optional)
- `priceAmount` (whole integer units)
- `currency` (`MMK` or `THB`)
- `stockQuantity` (integer)
- `isActive`
- timestamps

If inventory is variant-specific, stock belongs to the variant. Avoid simultaneously maintaining contradictory product-level and variant-level stock totals. Simple products can have a single default variant or a documented product-level stock representation.

## 7. Orders

Suggested `Order` fields:

- `id`
- `publicReference` (non-sequential, unique)
- `shopId`
- `customerUserId` (nullable for guest checkout)
- `customerName`
- `customerPhone`
- delivery address fields needed by the fulfillment workflow
- `subtotalAmount`
- `deliveryFeeAmount`
- `totalAmount`
- `currency` (`MMK` or `THB`)
- `paymentMethod` (`COD`)
- `paymentStatus` (`unpaid`, `paid`, `refunded`, `not_applicable` if needed)
- `fulfillmentStatus` (see `ORDER_LIFECYCLE.md`)
- `customerNote` (nullable)
- timestamps

Consider separating sensitive delivery/contact information into a restricted table if it helps enforce access boundaries.

## 8. Order items

Suggested `OrderItem` fields:

- `id`
- `orderId`
- `productId` (nullable if products may be deleted; otherwise preserve reference and archive)
- `variantId` (nullable)
- `productNameSnapshot` (display name in the locale used at checkout)
- `variantNameSnapshot` (nullable)
- `skuSnapshot` (nullable)
- `unitPriceAmount`
- `quantity`
- `lineTotalAmount`

Store money as whole integer units with an explicit currency. Recompute totals
on the server and preserve snapshots for historical accuracy. The order and all
of its money fields use one currency; do not mix currencies inside an order.

## 9. Favorites and likes (later)

Possible tables:

- `ProductLike(userId, productId, createdAt)` with unique `(userId, productId)`.
- `Favorite(userId, productId, createdAt)` with unique `(userId, productId)`.

Decide whether anonymous likes are supported. Avoid storing unnecessary device identifiers. Favorites usually require a customer account; likes can be account-based too for a simpler first implementation.

## 10. Reviews (later)

Suggested `Review`:

- `id`
- `orderItemId` or a suitable verified-purchase reference
- `customerUserId`
- `productId`
- `rating` (bounded integer, e.g. 1–5)
- `body` (optional)
- `status` (`published`, `hidden`, `flagged`)
- timestamps

Enforce eligibility so only customers with qualifying completed purchases can review. Decide whether one review per purchased item or one review per customer/product is allowed.

## 11. Inventory consistency

Choose one inventory policy and document it:

- Decrement at order placement and release on rejection/expiry; or
- Reserve inventory at placement, then commit at confirmation; or
- Decrement at confirmation, accepting that the merchant may need to reject oversold orders.

Whichever policy is chosen, implement concurrency-safe updates and test simultaneous orders. Never trust a quantity supplied by the browser as the current stock value.

## 12. Money and localization

### Money

| Currency | Unit | Digits | Example stored value |
| -------- | ---- | ------ | -------------------- |
| `MMK`    | Kyat | 0      | `1500` = K1,500      |
| `THB`    | Baht | 0      | `1234` = ฿1,234      |

- Store `amount` as a whole integer and `currency` as an explicit code.
- Validate amounts with shared Zod schemas on the server.
- Format with `Intl.NumberFormat` only in the UI.
- Do not perform floating-point arithmetic on money.
- No implicit exchange-rate conversion is part of the MVP.

### Localization

- Use a localized name map (`en`, `my`, later `shan`) for categories, shops,
  products, and variants.
- English is required; other locales may be absent.
- Fall back to English when a requested locale is missing.
- Keep slugs Latin-script and locale-independent.

## 13. Indexes and constraints to consider

- Unique shop slug.
- Unique category slug.
- Product indexes for `(shopId, status)`, `categoryId`, and publication time.
- Search indexes appropriate to the chosen language/search approach.
- Order indexes for `(shopId, createdAt)` and `(customerUserId, createdAt)`.
- Unique public order reference.
- Unique user/product constraints for likes and favorites.
- Check constraints for positive quantities, valid ratings, and non-negative amounts.
- Explicit foreign-key deletion behavior to preserve order history.
