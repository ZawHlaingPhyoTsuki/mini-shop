import "varlock/auto-load";

import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration.
 *
 * Migrations need a direct (non-pooled) connection because PgBouncer in
 * transaction mode does not support session-level state. `process.env` is
 * used instead of `env()` so `prisma generate` still works in CI without
 * database credentials.
 */
const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL;

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "varlock run -- bun src/db/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "",
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
});
