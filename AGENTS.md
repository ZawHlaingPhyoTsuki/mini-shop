# Mini Shop — AI Agent Guide

Read this file before making substantial changes. Then read the relevant documents under `docs/`.

## Product context

Mini Shop is a mobile-first product discovery and storefront platform for social-commerce merchants in Myanmar. Customers discover products across shops and place orders using cash on delivery (COD). Merchants manage their own shops, listings, inventory, and orders.

## Source of truth

- Product behavior and MVP: `docs/PRODUCT_SPEC.md`
- Architecture boundaries: `docs/ARCHITECTURE.md`
- Database entities and invariants: `docs/DATA_MODEL.md`
- Order states and transitions: `docs/ORDER_LIFECYCLE.md`
- Security and authorization: `docs/SECURITY.md`
- Object storage: `docs/STORAGE.md`
- Scope and phases: `docs/ROADMAP.md`
- Folder layout and code placement: `docs/FOLDER_STRUCTURE.md`
- Recorded decisions: `docs/DECISIONS.md`

If implementation and docs disagree, inspect the code, identify whether the difference is intentional, and update the relevant documentation rather than silently assuming.

## Stack

Use the existing stack unless a concrete limitation justifies a change:

- TanStack Start, TanStack Router, React, TypeScript, Vite
- Prisma 7 and Neon Postgres
- Better Auth with the Prisma adapter
- Neon S3-compatible object storage using AWS SDK packages
- TanStack Form, Zod, TanStack Query where appropriate
- Tailwind CSS, shadcn, Base UI, Lucide
- Bun, Varlock, Oxlint, Oxfmt

Do not introduce another ORM, authentication framework, storage SDK, or routing system without discussing the trade-off first.

## General engineering rules

1. Inspect existing files and conventions before editing. Avoid creating parallel abstractions that duplicate existing code.
2. Keep modules cohesive. Avoid a single giant route component or form component; split by responsibility when complexity warrants it.
3. Prefer explicit types and validated inputs at server boundaries.
4. Use Zod schemas for untrusted form input and server-side mutations. Client validation improves UX but does not replace server validation.
5. Keep secrets and privileged SDK clients server-only. Never expose database URLs, secret keys, or S3 credentials to browser code.
6. Enforce authentication, shop ownership, role checks, and resource access on the server.
7. Never trust a shop ID, price, discount, inventory value, or order total submitted by the browser without reloading and validating authoritative data on the server.
8. Use database transactions for operations that must succeed or fail together, including order creation, stock reservation/decrement, and order-item snapshots.
9. Store money as whole integer units with an explicit currency (`MMK` and `THB` have no decimals in this market). Do not use floating-point arithmetic for money or implicit exchange-rate conversion.
10. Use UTC timestamps in storage and format them for the user at the UI boundary.
11. Store user-facing names as localized maps (`en`, `my`, later `shan`). English is required and is the fallback; do not add one database column per locale.
12. Avoid leaking customer phone numbers, addresses, or order details in logs, analytics, URLs, and error messages.
13. Use meaningful, accessible labels and keyboard support. Design mobile-first.
14. Keep UI state and server state distinct. Use TanStack Query only where it adds value; do not add it mechanically to every loader or server function.
15. Do not invent functionality that is not in the product scope. Ask or record a decision when behavior is ambiguous.
16. Add or update tests for business rules, authorization, and important edge cases.
17. Do not claim checks passed unless you ran them.

## Database and migrations

- Follow the repository's pinned Prisma version and current APIs. The project pins Prisma 7.x exactly; do not upgrade to an 8.x release candidate without discussion.
- Keep schema definitions and migration configuration consistent with the existing repository.
- Author schema changes in `prisma/schema.prisma`, then create a migration with
  `bun run db:migrate:dev` (needs `SHADOW_DATABASE_URL`) or with
  `bun run db:diff`. Review the generated SQL before applying it; do not edit
  generated migration files casually.
- Use explicit foreign keys, indexes, uniqueness constraints, and deletion behavior.
- Preserve historical order data. Prefer archiving or soft deletion for products and shops referenced by orders.
- Do not assume a database transaction alone prevents every inventory race. Use an atomic conditional update, row locking, or another concurrency-safe strategy appropriate to the installed Prisma/Postgres APIs.
- Never run destructive commands against a shared or production database without explicit confirmation.

## Authentication and authorization

- Use Better Auth for identity and sessions.
- Treat authentication and application authorization as separate concerns.
- A signed-in user is not automatically a merchant or shop owner.
- Derive the actor from the verified server session, not from a user ID supplied by the client.
- Every merchant mutation must verify that the actor owns or is authorized to manage the target shop.
- Public endpoints must return only published, active, non-moderated data.
- Do not expose Better Auth internal tables as application-facing domain models unless required.

## Product and order rules

- Only published, active products from eligible shops are visible in public discovery.
- The server calculates prices, totals, stock, and delivery charges.
- An order belongs to one shop in the initial MVP.
- Copy product name, selected variant, SKU if used, and unit price into each order item.
- COD is a payment method, not an order status.
- Track fulfillment status separately from payment status.
- Validate all status transitions on the server.
- Prevent unauthorized users from viewing another customer's order or another merchant's order.
- Make order creation idempotent where practical to reduce duplicate submissions.

## Object storage

- Upload product images directly to S3-compatible storage using short-lived, scoped presigned requests or an equivalent safe server-mediated flow.
- The server must generate object keys; do not accept arbitrary storage keys from clients.
- Validate MIME type, file size, extension, and ownership. Do not trust the browser's content type alone.
- Store object keys and metadata in Postgres, not binary image contents.
- Keep credentials server-side. Confirm Neon S3 endpoint, region, bucket, and credential format from the current provider documentation before implementing.
- Decide deliberately whether public images use public bucket access, a CDN, or signed reads.

## Code quality and scripts

Use the scripts already present in `package.json`, including:

- `bun run check`
- `bun run check-types`
- `bun run db:generate`
- `bun run db:migrate`
- `bun run db:seed`

Inspect the script definitions before assuming a command's behavior. The current `check` script runs Oxlint and then formats files with Oxfmt; it may modify files.

## Completion checklist

Before finishing a change:

- [ ] Business rules and permissions are enforced server-side.
- [ ] Input is validated at trust boundaries.
- [ ] Loading, empty, success, and error states are considered.
- [ ] Relevant tests are added or updated.
- [ ] Database changes have reviewed migrations when appropriate.
- [ ] `bun run check` and `bun run check-types` were run when feasible.
- [ ] Documentation is updated if behavior, architecture, or decisions changed.
- [ ] The final summary clearly states what changed and what was not tested.
