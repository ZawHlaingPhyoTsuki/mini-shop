# Environment Configuration

The app validates environment variables with Varlock. `.env.schema` is the
contract; `.env` and platform secrets stay out of git. Never prefix a secret
with `VITE_`.

## Local development

Local development targets the permanent Neon `dev` branch, not production:

```bash
bunx neon checkout dev --project-id crimson-bird-64714144
bun run db:migrate
bun run db:seed
bun run dev
```

`neon checkout` pins the branch in `.neon` and pulls its variables into `.env`.
`neon.ts` keeps `dev` without an expiry and gives other non-default branches a
seven-day TTL. Production remains a separate branch.

Use `sslmode=verify-full` in both database URLs. Current `pg` versions treat
`sslmode=require` as `verify-full` but warn that this will change; being
explicit keeps the connection secure and the logs quiet.

`AWS_ACCESS_KEY_ID` is marked `@sensitive={preventLeaks=false}`: it is part of
every presigned upload URL handed to the browser, so Varlock must not block
those responses. The secret access key stays fully protected.

The local environment uses:

| Variable                | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `NODE_ENV`              | `development`, `production`, or `test`      |
| `BETTER_AUTH_SECRET`    | Session signing and encryption secret       |
| `BETTER_AUTH_URL`       | Canonical app URL, also used for auth hosts |
| `DATABASE_URL`          | Pooled runtime connection                   |
| `DATABASE_URL_UNPOOLED` | Direct migration connection                 |
| `AWS_ACCESS_KEY_ID`     | Branch-scoped object storage credential     |
| `AWS_SECRET_ACCESS_KEY` | Branch-scoped object storage credential     |
| `AWS_ENDPOINT_URL_S3`   | Branch-scoped S3 endpoint                   |
| `AWS_REGION`            | SigV4 region                                |
| `NEON_BUCKET_NAME`      | Bucket name (`assets`)                      |
| `NEON_BRANCH`           | Linked Neon branch, used by seed guards     |
| `SEED_ALLOW_PRODUCTION` | Set to `1` to allow seeding production      |
| `SHADOW_DATABASE_URL`   | Local Postgres used as the Prisma shadow DB |

## Deployment topology

- `apps/web` is the Next.js application; configure its server-only `SERVER_URL`
  to the NestJS API base URL.
- `apps/server` is the NestJS API; keep `DATABASE_URL`, Better Auth secrets,
  and S3 credentials there only.
- The web app's Better Auth proxy is intentionally limited to `/api/auth/*` so
  browser cookies remain first-party. It is not a marketplace API.
- Run migrations from `apps/server` against the intended Neon branch. Do not
  run them from a web build.

Set `BETTER_AUTH_URL` to the canonical production URL. Better Auth also accepts
`*.vercel.app` preview hosts and `localhost:3001`. Add a custom production
domain to `BETTER_AUTH_URL` so its host is trusted.

## Optional local Postgres

`prisma migrate dev` needs a shadow database. Point `SHADOW_DATABASE_URL` at
the local Postgres service (`postgres://postgres:password@localhost:5432/mini-shop`).
The same service is used for isolated database tests:

Start the Postgres-only Docker service:

```bash
bun run db:start
```

Point a separate test environment at the local database. Never run seed or test
cleanup against a shared or production database. The seed script refuses
`NODE_ENV=production` and `NEON_BRANCH=production`.

## Rules

- Keep local, preview, and production credentials separate.
- Do not expose database, auth, or S3 credentials to browser code.
- Rotate any secret that is accidentally exposed.
- Confirm provider-specific variable names before relying on them.
- Run `bun run env:generate` after changing `.env.schema`.
