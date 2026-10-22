import { attachDatabasePool } from "@vercel/functions";
import { PrismaPg } from "@prisma/adapter-pg";
import net from "node:net";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";

import type { DatabaseConfig } from "./config";

/*
 * Node tries each resolved address for only 250 ms by default. Neon's IPv4
 * addresses can take longer than that from some networks, so every attempt is
 * abandoned and pg reports ETIMEDOUT even though the database is reachable.
 */
net.setDefaultAutoSelectFamilyAttemptTimeout(2_000);

/**
 * Creates the application database client and its connection pool.
 *
 * @param env Server-only environment containing the pooled database URL.
 * @returns A Prisma client bound to the shared pg pool.
 */
export function createDb(env: DatabaseConfig) {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 10_000,
  });

  if (process.env.VERCEL) {
    attachDatabasePool(pool);
  }

  return new PrismaClient({ adapter: new PrismaPg(pool, { disposeExternalPool: true }) });
}

export type Database = ReturnType<typeof createDb>;
