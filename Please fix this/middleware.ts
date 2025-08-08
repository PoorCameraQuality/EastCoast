import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Temporary middleware that intentionally BYPASSES admin routes at the edge,
 * because you're handling admin protection client-side for now (per your request).
 *
 * This middleware can contain other edge logic for non-admin routes if needed
 * — but it will quickly return next() for /admin paths so the admin pages are not blocked.
 */

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // If path is admin or starts with /admin, bypass middleware checks
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // simply continue without manipulating response
    return NextResponse.next();
  }

  // Example: proceed normally for all other paths (you can add auth checks here in the future)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // apply to all except static assets
};
