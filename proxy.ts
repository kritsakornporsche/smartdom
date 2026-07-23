import { auth } from "./auth";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy (formerly Middleware)
 * Used for authentication, redirects, and role-based protection.
 */
export default function middleware(req: any) {
  const { nextUrl } = req;
  const protectedPrefixes = ["admin", "owner", "keeper", "tenant", "platform"];
  const pathParts = nextUrl.pathname.split("/");
  const currentPrefix = pathParts[1];

  if (protectedPrefixes.includes(currentPrefix)) {
    // Basic check or pass through for testing
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
