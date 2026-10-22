import "varlock/auto-load";

import { createDb } from "@/db";
import { createAuth } from "@/lib/auth";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
