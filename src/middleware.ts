/**
 * Next.js Middleware — session-based route protection.
 *
 * Protected routes: /dashboard, /profile, /editor/**
 * Public routes:    /, /login, /signup, /pricing, /api/auth/**, _next/static, etc.
 *
 * Guest users can still open the preset editor routes because the editor
 * components fall back to local preset data when the API returns 404.
 * We protect the non-preset editor paths only when no session exists.
 */

import { type NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

const PROTECTED_PATHS = ["/dashboard", "/profile"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    PROTECTED_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/editor/");

  if (!isProtected) return NextResponse.next();

  const session = await getSessionFromRequest(request);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match everything except:
     *  - _next/static (static files)
     *  - _next/image (image optimisation)
     *  - favicon.ico, svg, png, jpg, etc.
     *  - /api/** (API routes handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)",
  ],
};
