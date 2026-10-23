# Architecture

## 1. Architectural style

Use a two-application modular monolith: a Next.js web application in `apps/web`, a NestJS API in `apps/server`, one primary Postgres database, and one S3-compatible object store. Keep domain boundaries clear without introducing additional services prematurely.

`apps/server` owns the application API, Better Auth instance, Prisma access, authorization, business rules, and storage credentials. `apps/web` owns presentation and consumes that API. Do not implement marketplace endpoints as Next.js route handlers. The existing `apps/web/src/app/api/auth/[...path]/route.ts` route is an intentionally narrow same-origin proxy for Better Auth cookies, not a second API.

## 2. Logical modules

### Auth

- Better Auth configuration and session access.
- Sign-in/sign-up flows.
- Server-side actor resolution.
- Application role checks.

### Shops

- Shop creation and profile editing.
- Public storefront lookup by slug.
- Shop publication, suspension, and moderation state.
- Admin shop review queue with approve/reject actions and review notes.
- Shop-owner or member authorization.

### Catalog

- Product CRUD and publication.
- Categories.
- Product images and variants.
- Public search, filters, and sorting.
- Stock and availability.

### Media

- Create scoped upload authorizations.
- Validate upload metadata.
- Persist object keys.
- Delete or replace objects safely when permitted.

### Orders

- Checkout validation.
- Server-calculated totals.
- Order and item creation.
- Inventory consistency.
- Merchant order management.
- Fulfillment and payment status.

### Engagement (later)

- Likes and favorites.
- Verified-purchase reviews.
- Product-view events.

### Admin

- Category management.
- Shop/product moderation.
- Reports and moderation history.

### Code layout

NestJS feature modules, controllers, DTOs, services, authorization guards,
Prisma access, and storage operations live in `apps/server/src`; pages,
components, forms, and API transport code live in `apps/web/src`.

## 3. Request flow

Typical read:

1. Browser navigates to a Next.js route.
2. A Server Component or client-side data layer requests the NestJS API.
3. The NestJS controller validates request input and resolves the actor when required.
4. A feature service applies authorization and business rules, then uses Prisma.
5. Public queries apply publication and moderation constraints.
6. The web app renders loading, empty, error, and success states.

Typical mutation:

1. Browser submits a web form.
2. The web app sends the request to the NestJS API.
3. NestJS validates the payload using Zod or a DTO validation pipe and resolves the authenticated actor where required.
4. The feature service checks authorization and business invariants.
5. Prisma performs the mutation, using a transaction when multiple writes must remain consistent.
6. The API returns only data the caller is permitted to see.
7. The web UI refreshes or invalidates affected data.

Treat all browser input as untrusted, including IDs, prices, currencies, status
values, file keys, and totals.

## 4. Money and localization boundaries

- Money crosses the server boundary as an integer minor-unit amount plus an
  explicit currency (`MMK` or `THB`).
- The server validates the currency and recalculates totals; it never derives a
  price from a client-supplied amount or exchange rate.
- One order uses one currency. Mixing currencies inside an order is rejected.
- The current schema stores English/Myanmar fields explicitly. English is the
  fallback where a localized field exists; adding a locale requires a schema
  migration.
- Format money and resolve display names only at the UI boundary.

## 5. Route groups (suggested)

Public:

- `/` — marketplace discovery
- `/search` — product search
- `/categories/$slug` — category listings
- `/products/$slug` — product detail
- `/shops/$slug` — merchant storefront
- `/orders/confirmation/$publicReference` — safe order confirmation/status route, only if the reference is designed as a secret capability token or additional verification is required

Authentication:

- `/sign-in`
- `/sign-up`
- `/account/orders`
- `/account/favorites`

Merchant:

- `/dashboard`
- `/dashboard/shop`
- `/dashboard/products`
- `/dashboard/products/new`
- `/dashboard/products/$productId`
- `/dashboard/orders`
- `/dashboard/orders/$orderId`
- `/dashboard/settings`

Admin:

- `/admin/shops`
- `/admin/products`
- `/admin/categories`
- `/admin/reports`

These are proposed routes, not claims about existing implementation.

## 6. Data access boundaries

- Keep database access server-side.
- Public queries return only public fields and eligible records.
- Merchant queries require authorization for the specific shop.
- Admin queries require an explicit admin role.
- Avoid returning full database rows when a small view model is sufficient.
- Keep business rules in domain functions rather than duplicating them across route components.
- Do not put privileged S3 operations or database credentials in browser bundles.

## 7. Transactions and concurrency

Order creation should atomically:

- Validate that all requested products belong to the selected shop.
- Validate that products are published and purchasable.
- Resolve valid variants and prices from the database.
- Validate and reserve/decrement inventory according to the chosen stock policy.
- Calculate delivery and total amounts.
- Create the order and immutable item snapshots.

If any required operation fails, roll back the transaction. Use concurrency-safe stock updates so two simultaneous checkouts cannot oversell the same inventory.

Define whether stock is decremented at order placement or merchant confirmation. For a small COD marketplace, decrementing/reserving stock at placement is easier to reason about, but reservations need expiry/release behavior for rejected or abandoned orders. This policy should be recorded before implementation.

## 8. Caching and freshness

Public catalog pages may be cacheable after publication rules and invalidation are understood. Inventory and checkout totals must be revalidated against the database at order placement; never rely on cached product data for final order calculations.

Merchant order data and customer-specific data must not be publicly cached.

## 9. Observability

- Log request and error context without secrets or unnecessary personal data.
- Use a non-sensitive request/correlation ID for troubleshooting.
- Track order state changes in a way that supports support investigations.
- Avoid logging full phone numbers, addresses, session tokens, or signed upload URLs.
