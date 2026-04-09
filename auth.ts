import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import GitHub from 'next-auth/providers/github';
import Line from 'next-auth/providers/line';
import Credentials from 'next-auth/providers/credentials';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

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
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const users = await sql`
            SELECT id, name, email, password, role, sub_role 
            FROM users 
            WHERE email = ${String(credentials.email).toLowerCase().trim()} 
              AND is_active = TRUE
          `;
          
          if (users.length === 0) return null;
          const user = users[0];

          // ── Verify BCrypt Password ──────────────────────────────────────────
          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if (!isValid) return null;
          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
            sub_role: user.sub_role,
          };
        } catch (e) {
          console.error('[Authorize Error]', e);
          return null;
        }
      }
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

    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role || 'guest';
        token.sub_role = (user as any).sub_role || null;
        token.name = user.name;
      } else if (account?.type === 'oauth') {
        const users = await sql`SELECT role, sub_role FROM users WHERE email = ${token.email}`;
        if (users.length > 0) {
          token.role = users[0].role;
          token.sub_role = users[0].sub_role;
        } else {
          token.role = 'tenant';
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).sub_role = token.sub_role;
        session.user.name = token.name;
      }
      return session;
    },

    async redirect({ url, baseUrl, token }) {
      // By default redirect based on role isn't easy here without token in this scope, wait... JWT token is usually not available in redirect callback.
      // But we can check url in next middleware or rely on the frontend redirect in signIn route.
      // The signIn function in app/signin/page.tsx resolves after auth, and then NextAuth can redirect. 
      // Actually we will handle role-based redirect in middleware or the frontend after login.
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
});
