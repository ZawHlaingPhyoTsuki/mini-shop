import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import type { Database } from "@/db";

export type AuthConfig = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
};

/**
 * Extracts the host used by Better Auth for origin checks.
 *
 * @param url Public application URL.
 * @returns The URL host, including a non-default port when present.
 */
function authHost(url: string) {
  return new URL(url).host;
}

/**
 * Creates the Better Auth instance with the Prisma adapter and TanStack Start
 * cookie handling.
 *
 * @param env Server-only auth configuration.
 * @param database Prisma client used by the adapter.
 * @returns The configured Better Auth instance.
 */
export function createAuth(env: AuthConfig, database: Database) {
  const allowedHosts = [authHost(env.BETTER_AUTH_URL), "localhost:3001", "*.vercel.app"];

  return betterAuth({
    database: prismaAdapter(database, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: {
      allowedHosts,
      fallback: env.BETTER_AUTH_URL,
      protocol: "auto",
    },
    advanced: process.env.VERCEL ? { trustedProxyHeaders: true } : undefined,
    plugins: [tanstackStartCookies()],
  });
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
