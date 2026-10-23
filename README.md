# Mini Shop

Mini Shop is a mobile-first product discovery and storefront platform for social-commerce merchants in Myanmar. Customers browse products across shops and place cash-on-delivery (COD) orders; merchants manage their own shop, listings, inventory, and orders.

Mini Shop has a Next.js web application and a NestJS API. The web application consumes the API; NestJS owns the application endpoints, authentication integration, database access, and privileged storage operations.

## Product goals

- Make products searchable across participating shops.
- Give every merchant a shareable public storefront.
- Show clear product details, pricing, variants, and availability.
- Let customers place COD orders without a complicated checkout.
- Give merchants a straightforward workflow for products and orders.
- Build trust through accurate listings, moderation, and eventually verified-purchase reviews.

## Initial scope

### Customer

- Browse and search published products.
- Filter by category and sort results.
- View product details and merchant storefronts.
- Share product and shop links.
- Place a COD order.
- View order confirmation and status.

### Merchant

- Create and manage a shop.
- Create, edit, publish, unpublish, and archive products.
- Upload product images.
- Manage basic stock and variants where needed.
- Review orders and update permitted order statuses.
- Configure basic delivery information.

### Platform administration

- Review and manage shops.
- Hide or moderate listings.
- Manage product categories.
- Investigate reports and suspend abusive accounts when necessary.

### Out of scope for the first release

- Online payments and payment processing.
- Delivery-provider integrations or live shipping quotes.
- Cross-merchant checkout.
- Automated TikTok scraping or importing.
- AI recommendations and complex personalization.
- Paid promotions, subscriptions, and transaction fees.
- Advanced analytics.

## Core product decisions

- Public product and shop pages work without signing in.
- Guest checkout is supported; account order history can be added alongside it.
- Each checkout initially belongs to one shop.
- Orders use COD. Mini Shop records order and payment status but does not process money.
- Product name and price are snapshotted into order items so later listing edits do not rewrite history.
- Merchant permissions are enforced on the server, not only in the UI.
- Reviews are restricted to eligible purchasers once reviews are implemented.
- Money is stored as whole integer units with an explicit currency: `MMK`
  or `THB`, both without decimals. There is no implicit FX conversion.
- The current schema stores English and Myanmar fields explicitly; adding Shan
  requires a reviewed schema migration.

See [docs/DECISIONS.md](docs/DECISIONS.md) for the decision log.

## Technology stack

- **Web application:** Next.js App Router, React, TypeScript
- **Application API:** NestJS
- **Data access:** Prisma 7 (Rust-free client on the `pg` driver adapter)
- **Database:** Neon Postgres
- **Object storage:** Neon S3-compatible object storage via the AWS SDK
- **Authentication:** Better Auth with the Prisma adapter
- **Forms and validation:** TanStack Form, Zod
- **Server-state / async data:** TanStack Query where useful
- **UI:** Tailwind CSS, shadcn, Base UI, Lucide
- **Environment configuration:** Varlock and Neon environment tooling
- **Deployment:** independently deployable Next.js web and NestJS API services
- **Testing:** Vitest, Testing Library, jsdom
- **Tooling:** Bun, TypeScript, Oxlint, Oxfmt

See [docs/TECH_STACK.md](docs/TECH_STACK.md) for implementation notes and [docs/ROADMAP.md](docs/ROADMAP.md) for delivery phases.

## Getting started

Install dependencies:

```bash
bun install
```

Link the `dev` Neon branch and apply migrations:

```bash
bunx neon checkout dev --project-id crimson-bird-64714144
bun run db:migrate
bun run db:seed
```

The local `.env` points at `dev`, never production. For an isolated local
database instead, start the Postgres-only Docker service with `bun run db:start`.

Run the application:

```bash
bun run dev
```

Use `db:push` for deliberate local prototyping. For shared environments and production, use reviewed migrations generated and applied through the migration workflow. Never run schema push or destructive database operations against production casually.

## Neon setup

The app runs on a Neon project. `neon.ts` declares which Neon services each branch gets, and `neon deploy` provisions them and pulls their env vars into `.env`.

```bash
npm i -g neon@latest          # or: npx neon@latest

# Link the project and create neon.ts
neon init -y \
  --org-id org-small-scene-08936471 \
  --project-id crimson-bird-64714144 \
  --branch production \
  --services postgres,object-storage

# Provision Postgres + Object Storage and pull the branch env into .env
neon deploy
```

`neon deploy` writes these variables to `.env` (they are declared in `.env.schema`):

| Variable                | Used for                                                |
| ----------------------- | ------------------------------------------------------- |
| `DATABASE_URL`          | Pooled connection (PgBouncer) for app traffic           |
| `DATABASE_URL_UNPOOLED` | Direct connection used by the Prisma CLI for migrations |
| `AWS_ACCESS_KEY_ID`     | Object storage credential                               |
| `AWS_SECRET_ACCESS_KEY` | Object storage credential                               |
| `AWS_ENDPOINT_URL_S3`   | Branch-scoped S3 endpoint                               |
| `AWS_REGION`            | SigV4 signing region                                    |
| `NEON_BUCKET_NAME`      | Object storage bucket (defaults to `assets`)            |
| `NEON_BRANCH`           | Linked branch name                                      |

Regenerate the typed env accessor after changing `.env.schema`:

```bash
bun run env:generate
```

## Environment configuration

The app owns its environment schema in `.env.schema`. Varlock generates `src/env.ts` during installation; run `bun run env:generate` after changing a schema. Commit schemas, and keep secrets in ignored env files or your deployment platform.

Import the generated `ENV` accessor in application code. Bun's automatic env loading is disabled in `bunfig.toml`; the framework integration or server bootstrap loads Varlock. Node deployments must include Varlock and its dependencies alongside the app schema.

Run standalone Node/Bun tools that use Varlock from the project root so they load the app's schema and env files. `env:generate` only generates TypeScript files; it does not initialize environment values in a subsequent command.

## Database

Migrations run on the direct (non-pooled) connection string, because PgBouncer in transaction mode does not support session-level state:

```bash
bun run db:migrate    # apply pending migrations to Neon
bun run db:seed       # seed reference data
```

Author a migration with `bun run db:migrate:dev` (needs `SHADOW_DATABASE_URL`,
the local Postgres) or generate the SQL by hand with
`bun run db:diff --from-empty --to-schema prisma`.

The app uses the pooled `DATABASE_URL` through an explicit `pg` pool. On Vercel,
`attachDatabasePool` keeps Fluid compute alive long enough to drain idle
connections. Migrations always use `DATABASE_URL_UNPOOLED`.

## Object storage

`neon.ts` declares the `assets` bucket with `public_read` access. Uploads use the
S3 API through the AWS SDK, matching the object-storage setup used by the
`tcl-guide` project:

1. The web app asks the NestJS API for an upload ticket.
2. The server validates the content type and size, generates the object key, and
   returns a short-lived presigned `PUT` URL.
3. The browser uploads the file directly to Neon Object Storage.
4. The web app calls the NestJS API to verify the uploaded
   object (key ownership, content type, size) and saves the key in Postgres.
5. Public URLs are derived from `AWS_ENDPOINT_URL_S3` and `NEON_BUCKET_NAME`.

The bucket is public-read, so published images can be served directly. Object
keys are always generated on the server; clients never choose a bucket or key.
Credentials stay server-side.

## UI customization

shadcn/ui primitives live next to the app code.

- Change design tokens and global styles in `src/styles/globals.css`
- Update shared primitives in `src/components/ui/*`
- Adjust shadcn aliases or style config in `components.json`

### Add more components

Run this from the project root to add more primitives:

```bash
npx shadcn@latest add accordion dialog popover sheet table
```

Import them like this:

```tsx
import { Button } from "@/components/ui/button";
```

## Better Auth schema generation

After changing auth plugins or schema options, run this from the project root:

```bash
bun run auth:generate
```

The script runs the Better Auth CLI through `varlock run`, loading the auth instance from `apps/server/src/auth.ts`. Review the schema changes, then use the ORM's migration workflow to apply them.

## Deployment

Deploy the Next.js web application and NestJS API independently. Configure the
web application's `SERVER_URL` to point to the API. The web app may use its
same-origin Better Auth proxy; all marketplace operations still go to NestJS.

- Vercel Production uses the Neon `production` branch.
- Vercel Preview uses the Neon `dev` branch.
- Set the environment variables from `.env.schema` in Vercel.
- Set `BETTER_AUTH_URL` to the canonical production URL. Preview
  `*.vercel.app` hosts are accepted by the auth configuration.
- Run database migrations manually against the intended branch with the direct
  `DATABASE_URL_UNPOOLED` connection. Do not run migrations during the Vercel
  build.

`docker-compose.yml` now contains only the optional local Postgres service used
for development and integration tests; the web app is not deployed in Docker.

## Project structure

```
mini-shop/
├── src/
│   ├── components/
│   │   ├── ui/          # shadcn/ui primitives
│   │   └── *            # app components (header, auth forms, ...)
│   ├── db/              # Prisma client and seed script
│   ├── domain/          # Shared money, locale, validation, order rules
├── apps/
│   ├── server/          # NestJS API, auth, Prisma schema, feature modules
│   └── web/             # Next.js pages, components, forms, API transport
├── docs/                # Product, architecture, and delivery docs
├── .github/workflows/   # CI
├── public/
├── neon.ts              # Neon infrastructure-as-code
├── prisma.config.ts
├── vite.config.ts
└── components.json
```

## Available scripts

- `bun run dev`: Start the development server
- `bun run build`: Build for production
- `bun run serve`: Preview the production build
- `bun run check-types`: Build and check TypeScript types
- `bun run test`: Run unit tests once
- `bun run test:watch`: Run tests in watch mode
- `bun run check`: Run Oxlint and rewrite files with Oxfmt
- `bun run check:ci`: Run Oxlint and check formatting without writing
- `bun run db:generate`: Generate the Prisma client
- `bun run db:migrate`: Apply pending migrations
- `bun run db:migrate:dev`: Create and apply a migration (needs a shadow database)
- `bun run db:diff`: Print the SQL that would migrate the database
- `bun run db:push`: Push the schema to the database without migrations
- `bun run db:seed`: Seed categories on a non-production branch
- `bun run db:studio`: Open Prisma Studio
- `bun run db:start`: Start the optional local Postgres service
- `bun run db:stop`: Stop the local Postgres service

## Documentation

- [Product specification](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [Order lifecycle](docs/ORDER_LIFECYCLE.md)
- [Security and permissions](docs/SECURITY.md)
- [Storage and media](docs/STORAGE.md)
- [Roadmap](docs/ROADMAP.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Decisions](docs/DECISIONS.md)
- [Environment configuration](docs/ENVIRONMENT.md)
- [Testing strategy](docs/TESTING.md)
- [Folder structure](docs/FOLDER_STRUCTURE.md)
- [AI agent guide](AGENTS.md)

## Status

This repository is the starting point for Mini Shop. Treat the documentation as the intended direction, not proof that every feature is implemented. Update the docs when a product or architecture decision changes.
