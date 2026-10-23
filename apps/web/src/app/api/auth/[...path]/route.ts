import { serverUrl } from "@/lib/server-url";

/**
 * Same-origin proxy for Better Auth.
 *
 * The browser only talks to `<web>/api/auth/*` (first-party), so the
 * session cookie is set on the web domain and `SameSite=Lax` works.
 * Requests are forwarded server-to-server to the NestJS API, which owns
 * the Better Auth instance and the database.
 *
 * Why not call the API directly from the browser? Web
 * (`tcl-guide.vercel.app`) and API (`*.azurewebsites.net`) are different
 * sites: a `Set-Cookie` from the API is third-party and gets dropped, and
 * the cookie would never be visible to middleware / Server Components.
 */
async function proxyAuth(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/auth/, "") || "/";
  const target = `${serverUrl()}/api/auth${path}${url.search}`;

  const headers = new Headers();
  const forward = [
    "cookie",
    "content-type",
    "origin",
    "referer",
    "user-agent",
    "x-forwarded-for",
    "x-forwarded-proto",
  ];
  for (const name of forward) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  // Tell the API the original public protocol so Secure cookies are set
  // correctly even though the proxy hop itself is plain HTTP.
  if (!headers.has("x-forwarded-proto")) {
    headers.set("x-forwarded-proto", new URL(request.url).protocol.replace(":", ""));
  }

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
    redirect: "manual",
  });

  const body = await upstream.arrayBuffer();
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "content-encoding" || lower === "content-length" || lower === "set-cookie")
      return;
    responseHeaders.append(key, value);
  });

  // Re-scope cookies to the web domain (HostOnly): drop any Domain
  // attribute pointing at the API host so the browser stores them
  // first-party. Keep Secure / HttpOnly / SameSite as set by the API.
  const setCookies: string[] =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : (() => {
          const single = upstream.headers.get("set-cookie");
          return single ? [single] : [];
        })();
  for (const cookie of setCookies) {
    responseHeaders.append(
      "set-cookie",
      cookie
        .split(";")
        .filter((part) => !/^\s*domain=/i.test(part))
        .join(";"),
    );
  }

  return new Response(body, { status: upstream.status, headers: responseHeaders });
}

export const GET = proxyAuth;
export const POST = proxyAuth;
export const PUT = proxyAuth;
export const PATCH = proxyAuth;
export const DELETE = proxyAuth;
export const OPTIONS = proxyAuth;
export const HEAD = proxyAuth;
