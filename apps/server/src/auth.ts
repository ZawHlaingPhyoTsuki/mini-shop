import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";

import type { PrismaClient } from "./generated/client.js";
import { parseCorsOrigins } from "./utils/cors.js";

export type AuthConfig = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  CORS_ORIGIN: string;
};

export function createAuth(env: AuthConfig, database: PrismaClient) {
  const trustedOrigins = parseCorsOrigins(env.CORS_ORIGIN);

  return betterAuth({
    database: prismaAdapter(database, {
      provider: "postgresql",
    }),
    trustedOrigins,
    emailAndPassword: { enabled: true },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL, // API Server URL
    plugins: [admin()],
  });
}

export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
