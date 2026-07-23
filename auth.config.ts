import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: 'A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8',
  pages: {
    signIn: '/signin',
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const user = auth?.user as any;
      
      const protectedPrefixes = ["admin", "owner", "keeper", "tenant"];
      const pathParts = nextUrl.pathname.split("/");
      const currentPrefix = pathParts[1];

      // Only care about protected routes
      if (protectedPrefixes.includes(currentPrefix)) {
        if (!isLoggedIn) return false; // Redirect to sign-in
        if (currentPrefix === 'admin' && user.role === 'platform_admin') {
           return true; // Allow platform_admin to access /admin
        }
        if (user.role !== currentPrefix) {
           return Response.redirect(new URL("/explore", nextUrl));
        }
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
