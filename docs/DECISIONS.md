# Architecture and Product Decisions

This file records decisions and their status. Update it when a choice is made or superseded.

## Accepted direction

### D-001: Build a marketplace and storefront, not a replacement for TikTok

**Status:** Accepted

Mini Shop organizes products and supports ordering while merchants continue to use TikTok and other social channels for content and audience building.

### D-002: Use a modular monolith for the MVP

**Status:** Accepted

One TanStack Start application with clear domain modules is sufficient. Do not introduce microservices without demonstrated need.

### D-003: COD is the initial payment method

**Status:** Accepted

Mini Shop records orders and payment status but does not process online payments in the initial release.

### D-004: One shop per checkout

**Status:** Accepted

Keep the first checkout limited to one merchant. Revisit cross-merchant cart only after validating demand.

### D-005: Public browsing does not require authentication

**Status:** Accepted

Product discovery and public storefronts should be accessible to search engines and shared social links.

### D-006: Guest checkout is supported

**Status:** Accepted

Avoid requiring customer registration to place an order. Protect guest order tracking with a non-guessable reference and verification.

### D-007: Product and order data live in Neon Postgres

**Status:** Accepted

Use Prisma for application data access and version-controlled migrations for shared environments.

### D-008: Product media uses S3-compatible object storage

**Status:** Accepted

Store object keys and metadata in Postgres. Keep S3 credentials on the server.

### D-009: Merchant approval

**Status:** Accepted

Self-service registration is open, but a shop must be approved before its
listings become public. Revisit if moderation capacity cannot keep up.

### D-010: Inventory timing

**Status:** Accepted

Decrement stock atomically at order placement and release it on rejection,
cancellation, or reservation expiry. Use a conditional update or row lock so
two simultaneous checkouts cannot oversell the last unit.

### D-011: Delivery fee model

**Status:** Accepted

Use a fixed merchant-configured delivery fee for the MVP. Revisit area-based
fees after merchant interviews. The server calculates the final total.

### D-012: Public image access

**Status:** Accepted

The `assets` bucket uses `public_read`. Public URLs are derived from the bucket
endpoint; uploads remain server-authorized and presigned. If draft moderation
requires stricter access, switch to signed reads later.

### D-013: Shop slug and product URL

**Status:** Accepted

Product slugs are globally unique for the MVP. Public product routes use
`/products/$slug`; shop routes use `/shops/$slug`.

### D-014: Review eligibility

**Status:** Accepted

Only customers with a qualifying delivered/completed order may review the
purchased product.

### D-015: Primary launch category

**Status:** Hypothesis

Fashion and accessories are the working hypothesis, to be validated with
merchant interviews before launch.

### D-016: Production hosting/runtime

**Status:** Accepted

Deploy the TanStack Start/Vite/Nitro application to Vercel. Vercel runs the
Node.js server output; Bun is the package manager and build tool. The web app
is not deployed through Docker. Use an explicit `pg` pool with Vercel's
`attachDatabasePool` and the pooled `DATABASE_URL`. Vercel Preview maps to the
Neon `dev` branch and Production maps to the `production` branch.

### D-017: Object storage upload pattern

**Status:** Accepted

Use the AWS SDK directly against Neon Object Storage, matching `tcl-guide`:
`forcePathStyle`, server-generated keys, five-minute presigned `PUT` uploads,
post-upload verification, and public read URLs from
`{AWS_ENDPOINT_URL_S3}/{NEON_BUCKET_NAME}/{key}`. Do not use a second storage
abstraction.

### D-018: Multi-currency money

**Status:** Accepted

Support Myanmar Kyat (`MMK`) and Thai Baht (`THB`). Store money as a whole
integer amount plus an explicit currency code. Both currencies are used
without decimal places in the target market. Never store money as a float.
A listing or order has one currency; there is no implicit exchange-rate
conversion. If a product must be purchasable in both currencies, store explicit
per-currency prices set by the merchant rather than deriving one from the other.
Format money only at the UI boundary.

### D-019: Localized names

**Status:** Accepted

Store user-facing names as a localized map, for example
`{ "en": "Fashion", "my": "ဖက်ရှင်" }`, rather than separate columns for every
locale. English is required; other locales are optional until content is ready.
The initial build supports English and Myanmar, with Shan and at most a few more
locales expected later. Add a locale by extending the shared locale list and
validation; no per-locale database column is required. Read paths fall back to
English when the requested locale is unavailable.

### D-020: Prisma 7 replaces Drizzle RC

**Status:** Accepted

Application data access uses Prisma 7, pinned to exactly `7.10.1` for `prisma`,
`@prisma/client`, and `@prisma/adapter-pg`. The npm `latest` tag points at an
8.x release candidate, so the version range must never be widened.

The schema lives in `prisma/`: `prisma/schema.prisma` holds the application
models and `prisma/auth.prisma` holds the Better Auth models, which are
generated by the Better Auth CLI (`bun run auth:generate`) and hand-tuned
afterwards. The Rust-free client is generated into `src/generated/prisma`,
which is gitignored and regenerated by `bun run db:generate`; the build and
type check depend on that step.

The client runs on the `pg` driver adapter over an explicit `pg` pool so the
Vercel `attachDatabasePool` behaviour and the Node/Neon connection timeout fix
stay in one place. Migrations always use `DATABASE_URL_UNPOOLED`;
`prisma migrate dev` also needs a shadow database (`SHADOW_DATABASE_URL`).

The existing Neon databases were reset and rebuilt from a single baseline
migration because the data was disposable. Production is migrated the same way
once the Prisma switch is verified.
