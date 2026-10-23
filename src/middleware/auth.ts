import { auth } from "@/lib/auth";
import { createMiddleware } from "@tanstack/react-start";

/**
 * Resolves the session for each request and exposes it in server context.
 */
export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  return next({
    context: { session },
  });
});
