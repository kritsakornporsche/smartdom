import type { NextAuthConfig } from "next-auth";

export const authConfig = {
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
        if (user.role !== currentPrefix) {
           return Response.redirect(new URL("/explore", nextUrl));
        }
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
