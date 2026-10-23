import { createAuthClient } from "better-auth/react";

// Same-origin: requests go to `<web>/api/auth/*`, which proxies
// server-to-server to the NestJS API (see app/api/auth/[...path]/route.ts).
// An absolute API URL here would make the session cookie third-party and
// the browser would drop it in production.
export const authClient = createAuthClient();
