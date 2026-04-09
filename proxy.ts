import { auth } from "./auth";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy (formerly Middleware)
 * Used for authentication, redirects, and role-based protection.
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as any;
  
  console.log(`[Proxy] ${req.method} ${nextUrl.pathname} | LoggedIn: ${isLoggedIn}`);

  const protectedPrefixes = ["admin", "owner", "keeper", "tenant"];
  const pathParts = nextUrl.pathname.split("/");
  const currentPrefix = pathParts[1];

  // Role-based protection
  if (protectedPrefixes.includes(currentPrefix)) {
    if (!isLoggedIn) {
      const callbackUrl = nextUrl.pathname + nextUrl.search;
      return NextResponse.redirect(new URL(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
    }
    
    // Strict role check
    if (user.role !== currentPrefix) {
      const role = user?.role || 'guest';
      const fallback = role === 'guest' ? '/explore' : `/${role}`;
      return NextResponse.redirect(new URL(fallback, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
