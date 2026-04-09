import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import GitHub from 'next-auth/providers/github';
import Line from 'next-auth/providers/line';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

// Ensure social users are saved to the users table
async function upsertSocialUser({
  name,
  email,
  provider,
}: {
  name: string;
  email: string;
  provider: string;
}) {
  try {
    await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${email}, ${'[oauth:' + provider + ']'}, 'tenant')
      ON CONFLICT (email) DO NOTHING
    `;
  } catch (e) {
    console.error('[upsertSocialUser]', e);
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Line({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: '/signin',
    error: '/signin',
  },

  callbacks: {
    async signIn({ user, account }) {
      // Auto-save social login users to our DB
      if (account?.type === 'oauth' && user.email && user.name) {
        await upsertSocialUser({
          name: user.name,
          email: user.email,
          provider: account.provider,
        });
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to /admin after social sign-in
      if (url.startsWith(baseUrl)) return url;
      return baseUrl + '/admin';
    },
  },
});
