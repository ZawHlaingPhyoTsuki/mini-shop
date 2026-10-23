import "varlock/auto-load";
import { createAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ENV } from "./env.server";

const auth = createAuth(ENV, prisma);
export { prisma, auth };
