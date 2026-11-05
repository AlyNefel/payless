import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Completely bypass API routes, Next.js internals, and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Admin route protection
  if (pathname.startsWith("/admin")) {
    // Allow access to login page
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.next();
    }

    const token =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value ||
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. Apply i18n middleware for public routes only
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except:
    // - api (API routes like /api/auth, /api/seed, etc.)
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - all files with extensions (e.g. favicon.ico, sw.js, images, fonts)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
