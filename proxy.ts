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

  const protectedPrefixes = ["admin", "owner", "keeper", "tenant", "platform"];
  const pathParts = nextUrl.pathname.split("/");
  const currentPrefix = pathParts[1];

  // Role-based protection
  if (protectedPrefixes.includes(currentPrefix)) {
    if (!isLoggedIn) {
      const callbackUrl = nextUrl.pathname + nextUrl.search;
      const signInUrl = new URL(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Strict role check
    const requiredRole = currentPrefix === 'platform' ? 'platform_admin' : currentPrefix;
    if (user.role !== requiredRole && !(currentPrefix === 'admin' && user.role === 'platform_admin')) {
      const role = user?.role || 'guest';
      const fallback = role === 'platform_admin' ? '/platform' : (role === 'guest' ? '/explore' : `/${role}`);
      return NextResponse.redirect(new URL(fallback, req.url));
    }
  }


  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
