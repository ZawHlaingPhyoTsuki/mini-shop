import "varlock/auto-load";
import { ENV } from "@/env.server";

import type { PrismaClient } from "@/generated/prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { prisma } from "./prisma";

export type AuthConfig = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
};

function authHost(url: string) {
  return new URL(url).host;
}

export function createAuth(env: AuthConfig, database: PrismaClient) {
  const allowedHosts = [authHost(env.BETTER_AUTH_URL), "localhost:3001", "*.vercel.app"];

  return betterAuth({
    database: prismaAdapter(database, { provider: "postgresql" }),
    user: {
      additionalFields: {
        role: {
          type: "string",
          input: false,
        },
      },
    },
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

export const auth = createAuth(ENV, prisma);
export type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];
