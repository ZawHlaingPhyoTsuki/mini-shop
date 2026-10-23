# Data Model

This document describes the current domain model. The canonical source is the
Prisma schema in `apps/server/prisma/schema/`; when this document conflicts
with that schema, the schema wins and this document must be corrected.

## 1. Identity

### Better Auth tables

Use the tables required by the installed Better Auth configuration and Prisma adapter (`prisma/auth.prisma`). Keep these authentication records distinct from marketplace domain concepts.

### Shop membership

Each user has a Better Auth `role` that defaults to `customer`. Each user may
own at most one shop, enforced by the unique `Shop.ownerUserId`. There is no
`ShopMember` model yet. Do not assume a user's session grants shop access.
Owning a shop does not grant the global `admin` role.

## 2. Shop

Implemented fields:

- `id`
- `ownerUserId` (unique)
- `name`
- `slug` (unique)
- `descriptionEn`, `descriptionMy` (nullable)
- `logoObjectKey` (nullable)
- `bannerObjectKey` (nullable)
- `contactPhone` (nullable)
- `socialLinks` (structured JSON or normalized table)
- `status` (`DRAFT`, `PENDING_REVIEW`, `ACTIVE`, `SUSPENDED`, `CLOSED`)
- `reviewNote`, `reviewedAt`, `reviewedByUserId` (nullable review audit fields)
- `createdAt`
- `updatedAt`

Rules:

- Slugs must be unique and one user may own only one shop.
- The schema defaults a new shop to `DRAFT`. The NestJS onboarding flow must
  explicitly submit it to `PENDING_REVIEW`; only an admin review may set it to
  `ACTIVE`.
- Rejection sets `DRAFT` plus `reviewNote`, `reviewedAt`, and `reviewedByUserId`; the owner edits and resubmits.
- Only the owner (resolved from `ownerUserId`) may edit the shop.
- Public storefronts require an eligible shop status.
- A suspended shop's products must not appear in public search.

## 3. Category

Implemented fields:

- `id`
- `nameEn` (required), `nameMy` (nullable)
- `slug` (unique)
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

English is required and is the fallback locale. The current schema uses
`name_en` / `name_my` columns rather than a JSON map; add further locales with
an explicit schema change when Shan support is scheduled.

Categories are administered by the platform, not freely created by every merchant in the initial MVP.

## 4. Product

Implemented fields:

- `id`
- `shopId`
- `categoryId`
- `nameEn` (required), `nameMy` (nullable)
- `slug`
- `descriptionEn`, `descriptionMy` (nullable)
- `priceMMK` (whole Kyat), `priceTHB` (whole Baht, nullable)
- `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`, `HIDDEN`)
- `stockQuantity` (nullable; `null` means stock is not tracked)
- `sku` (nullable)
- `createdAt`
- `updatedAt`
- `publishedAt` (nullable)

Rules:

- Product slug uniqueness may be scoped to the shop; public routes should then use both shop slug and product slug, or use a globally unique public slug.
- Price must be a valid non-negative or positive integer according to the listing policy.
- Only active shop listings can be public.
- Product changes must not mutate historical order item snapshots.

## 5. Product images

`ProductImage` links a product to an `Asset` owned by a user. Its fields are:

- `id`
- `productId`
- `assetId`
- `altText`
- `sortOrder`
- `createdAt`

`Asset` holds the bucket, object key, content type, size, owner, and creation
time. Store object keys rather than binary image data or long-lived signed URLs.

## 6. Inventory and variants

The current schema supports product-level inventory only through nullable
`Product.stockQuantity`. It has no `ProductVariant` model. A later variants
change must include schema, order-item snapshot, pricing, and inventory-policy
updates together rather than assuming variant support exists.

## 7. Orders

Implemented `Order` fields include:

- `id`
- `orderNumber` (unique)
- `shopId`
- `userId` (required)
- recipient name, phone, country code, region, city, address lines, postal
  code, and delivery instructions (the shipping-address snapshot)
- `subtotalAmount`
- `shippingFee`
- `discountAmount`
- `totalAmount`
- `currency` (`MMK` or `THB`)
- `paymentMethod` (`COD`)
- `paymentStatus` (`unpaid`, `paid`, `refunded`, `not_applicable` if needed)
- `status` (`PLACED`, `CONFIRMED`, `PACKING`, `SHIPPED`, `DELIVERED`,
  `CANCELLED`, `REJECTED`, `RETURNED`)
- `customerNote` (nullable)
- timestamps

The current schema requires an authenticated user for every order; guest
checkout is not represented yet. It also uses one order status plus a separate
payment status. Any future fulfillment/payment model revision must update the
schema and lifecycle documentation together.

## 8. Order items

Implemented `OrderItem` fields include:

- `id`
- `orderId`
- `productId` (nullable if products may be deleted; otherwise preserve reference and archive)
- `productNameEn`, `productNameMy`, and `productSlug` snapshots
- `unitPrice`
- `quantity`
- `lineTotal`

Store money as whole integer units with the order's explicit currency. Recompute
totals on the server and preserve snapshots for historical accuracy.

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

The current schema uses English/Myanmar columns: `nameEn`/`nameMy` for
categories and products, plus `descriptionEn`/`descriptionMy` for shops and
products. English is required for category and product names; Myanmar is
nullable. A localized JSON/map model is not implemented, so adding Shan needs
an explicit schema decision and migration.

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
