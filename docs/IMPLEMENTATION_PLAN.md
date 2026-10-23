# Implementation Plan

This plan turns the product documentation into buildable phases. It reflects the
current repository, not just the target architecture.

## Current state

- Next.js, React, Tailwind, and shadcn are wired up in `apps/web`.
- NestJS owns the API in `apps/server`; the web app consumes it through `SERVER_URL`.
- Better Auth uses the Prisma adapter and supports email/password sessions.
- Prisma points at Neon Postgres; migrations use `DATABASE_URL_UNPOOLED`.
- Neon Object Storage is configured with the AWS SDK: presigned `PUT` uploads,
  server-generated keys, and a `public_read` `assets` bucket.
- Existing UI: `/login`, `/_auth/dashboard`, avatar upload.
- Vitest, baseline domain tests, and GitHub Actions CI are configured.
- Neon has a permanent `dev` branch for local/preview work; local `.env` points
  to it, while Vercel Production uses the `production` branch.
- The `category` table exists with localized JSONB names and seeded launch
  categories.
- Missing: shops, products, orders, admin, and the feature UIs.

## Decisions locked

See [DECISIONS.md](DECISIONS.md). Key defaults:

- Self-service merchant registration with approval before public publication.
- Stock decremented atomically at order placement and released on rejection or
  cancellation.
- Fixed merchant-configured delivery fee.
- Public-read product images with server-authorized uploads.
- Globally unique product slugs.
- Guest checkout with a non-guessable order reference.

## Phase 0 — Foundation

**Goal:** make changes safe and repeatable before adding domain tables.

- [x] Add Vitest (Node by default; jsdom per React test) and baseline tests.
- [x] Add `bun run test` and baseline unit tests.
- [x] Add CI for install, lint/format check, type check, and tests.
- [ ] Add shared validation schemas for slugs, money, quantities, locales, and status
      values in the relevant NestJS feature modules.
- [x] Add server-side authorization helpers for shop ownership.
- [x] Add an idempotent category seed with a production guard.
- [x] Replace Drizzle RC with Prisma 7 (pinned), generate the Rust-free client,
      and rebuild the dev database from a baseline migration.
- [x] Use local Docker Postgres for future database integration tests; use an
      isolated test database and refuse non-local hosts.
- Defer empty `shops`, `catalog`, `orders`, and `admin` modules until each has
  real business logic. Keep rules out of route components.

**Exit criteria:** `bun run check:ci`, `bun run check-types`, and
`bun run test` pass locally and in CI.

## Phase 1 — Catalog and merchant onboarding

**Goal:** a merchant can publish a shop and products; a visitor can discover and
share them without signing in.

### Schema

- `shop`: owner, name, unique slug, description, branding keys, contact links,
  status, delivery fee, timestamps.
- `category`: localized names (English required, Myanmar now, Shan later),
  unique slug, sort order, active flag. Implemented.
- `product`: shop, category, localized names, unique slug, description, price
  amount and currency (`MMK` or `THB`), status, publication timestamp.
- `product_image`: product, object key, alt text, sort order.
- `product_variant`: product, localized name, optional SKU, price, currency,
  stock, active flag.
- `asset`: extend for shop and product ownership instead of adding a second
  upload system.

Add unique constraints, foreign keys, check constraints for non-negative money
and stock, and indexes for public catalog queries.

### Server and UI

- Shop create/edit, slug validation, and publication status.
- Merchant dashboard layout and navigation under `/_auth/dashboard`.
- Product create/edit/archive with variants and image upload.
- Public routes: `/`, `/search`, `/categories/$slug`, `/products/$slug`,
  `/shops/$slug`.
- Public queries filter by product status, shop status, and moderation state.
- Search, category filter, and basic sorting.
- Share metadata for product and shop pages.
- Minimal admin moderation for shops and products.

### Tests

- Public catalog excludes drafts, archived products, and suspended shops.
- A user cannot edit another user's shop or products.
- Slugs are unique and validated.
- Product image uploads reject forged keys and oversized files.

**Exit criteria:** a visitor can find, open, and share a published product; a
merchant can manage only their own shop.

## Phase 2 — COD ordering

**Goal:** a customer can place a COD order and the merchant can fulfill it
without leaking another customer's data.

### Schema

- `order`: public reference, shop, optional customer user, contact and delivery
  fields, subtotal, delivery fee, total, one currency (`MMK` or `THB`), payment
  status, fulfillment status, timestamps.
- `order_item`: order, product/variant references, name/variant/SKU/unit-price
  snapshots, quantity, line total.
- `order_event`: order, previous/new status, actor, timestamp.

### Server and UI

- One-shop cart.
- Checkout form with Zod validation.
- Server reloads products and variants; never trusts client prices, currency, or
  totals.
- Transaction creates the order and snapshots and decrements stock atomically.
- Idempotency token prevents duplicate submissions.
- Guest confirmation and tracking use `publicReference` plus verification.
- Merchant order inbox and order detail.
- Server-validated fulfillment transitions; payment status tracked separately.
- Release stock on rejection or cancellation.
- Rate-limit checkout and tracking attempts.

### Tests

- Two simultaneous orders for the last unit: one succeeds, one fails.
- Client-supplied price and total are ignored.
- Merchant cannot read another shop's orders.
- Customer cannot read another customer's order.
- Invalid status transitions are rejected.
- Rejection and cancellation release stock.

**Exit criteria:** end-to-end COD order works on a narrow mobile viewport and
order data is isolated by shop and customer.

## Phase 3 — Engagement and trust

Defer until ordering is stable:

- Customer order history and favorites.
- Verified-purchase reviews.
- Merchant verification and reporting.
- Product-view and order analytics.

## Phase 4 — Growth

Only with validated demand:

- Burmese/English search improvements.
- Discounts and labeled promotions.
- Multi-shop cart.
- Delivery integrations.
- Premium merchant tools.

## Verification per change

Run the repository scripts after each phase:

```bash
bun run check:ci
bun run check-types
bun run test
```

`bun run check` runs Oxlint and rewrites files with Oxfmt, so review the diff
afterward. Use `check:ci` in CI because it does not modify files. Never run schema push or destructive database commands against
shared or production databases.
