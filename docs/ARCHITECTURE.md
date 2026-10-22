# Architecture

## 1. Architectural style

Use a modular monolith: one TanStack Start application, one primary Postgres database, and one S3-compatible object store. Keep domain boundaries clear without introducing separate services prematurely.

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

The folder map and the rules for placing new code are in
[docs/FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md). The short version: pure
business rules live in `src/domain`, infrastructure wrappers in `src/lib`,
database access in `src/db`, HTTP endpoints in `src/routes`, and server
functions in `src/functions`.

## 3. Request flow

Typical read:

1. Browser navigates to a typed TanStack route.
2. Route validates parameters and search parameters.
3. Route loader or server function requests the required domain data.
4. Domain/data-access code queries Postgres through Prisma.
5. Public queries apply publication and moderation constraints.
6. UI renders loading, empty, error, and success states.

Typical mutation:

1. Browser submits a form or calls a server function.
2. Server validates payload using Zod.
3. Server resolves the authenticated actor where required.
4. Domain logic checks authorization and business invariants.
5. Prisma performs the mutation, using a transaction when multiple writes must remain consistent.
6. The response returns only the data the caller is permitted to see.
7. The UI updates or invalidates affected data.

Treat all browser input as untrusted, including IDs, prices, currencies, status
values, file keys, and totals.

## 4. Money and localization boundaries

- Money crosses the server boundary as an integer minor-unit amount plus an
  explicit currency (`MMK` or `THB`).
- The server validates the currency and recalculates totals; it never derives a
  price from a client-supplied amount or exchange rate.
- One order uses one currency. Mixing currencies inside an order is rejected.
- User-facing names are localized maps. English is required and is the fallback.
  The read path resolves the requested locale without changing stored data.
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
