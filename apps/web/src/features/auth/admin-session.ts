import "server-only";

import { cookies } from "next/headers";
import { serverUrl } from "@/lib/server-url";
import type { Session } from "./types/session";

const SESSION_COOKIE_NAMES = [
  "__Secure-better-auth.session_token", // production (HTTPS)
  "better-auth.session_token", // local dev (HTTP)
] as const;

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) => cookieStore.get(name));
  if (!hasSessionCookie) return null;

  try {
    const apiUrl = serverUrl();
    // Forward every cookie: get-session also reads the session_data
    // cookie cache when present, and the secure cookie name differs
    // between local (http) and prod (https).
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(`${apiUrl}/api/auth/get-session`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store", // Critical: Do not cache private user data
    });

    if (!res.ok) return null;

    return res.json();
  } catch (error) {
    console.error("Failed to fetch session from NestJS:", error);
    return null;
  }
}
