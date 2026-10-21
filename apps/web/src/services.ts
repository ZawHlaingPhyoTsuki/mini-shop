import { createAuth } from "@mini-shop/auth";
import { createDb } from "@mini-shop/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
