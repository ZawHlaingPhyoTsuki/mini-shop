import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Define routes that REQUIRE authentication
const privateRoutes = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the current path is protected
  const isProtected = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // 2. If it's not a protected route, allow it immediately
  if (!isProtected) {
    return NextResponse.next();
  }

  // 3. For protected routes, check if the session cookie exists
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    // Redirect to login if no cookie is found
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. If cookie exists, let the request proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
