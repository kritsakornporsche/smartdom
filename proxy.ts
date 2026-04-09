import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy (formerly Middleware)
 * Used for authentication, redirects, and rewrites.
 */
export function proxy(request: NextRequest) {
  // Simple logging for demonstration
  console.log(`[Proxy] ${request.method} ${request.nextUrl.pathname}`);
  
  return NextResponse.next();
}

export const proxyConfig = {
  // Match all request paths except for the ones starting with:
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
