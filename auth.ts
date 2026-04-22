import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import GitHub from 'next-auth/providers/github';
import Line from 'next-auth/providers/line';
import Credentials from 'next-auth/providers/credentials';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

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
  ...authConfig,
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

          // ── Verify BCrypt Password or Legacy SHA-256 ─────────────────────
          let isValid = false;
          if (user.password.startsWith('$2')) {
            isValid = await bcrypt.compare(credentials.password as string, user.password);
          } else if (user.password.length === 64) {
            const crypto = require('crypto');
            const sha256Hash = crypto.createHash('sha256').update(credentials.password as string).digest('hex');
            isValid = (sha256Hash === user.password);
          } else {
            isValid = (credentials.password === user.password);
          }

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
        token.id = user.id;

        // Fetch dorm_id immediately on login for relevant roles
        try {
          if (token.role === 'owner') {
            const dorms = await sql`SELECT id FROM dormitory_profile WHERE owner_id = ${parseInt(user.id as string)} LIMIT 1`;
            if (dorms.length > 0) token.dorm_id = dorms[0].id;
          } else if (token.role === 'keeper') {
            const keepers = await sql`SELECT dorm_id FROM keepers WHERE user_id = ${parseInt(user.id as string)} LIMIT 1`;
            if (keepers.length > 0) token.dorm_id = keepers[0].dorm_id;
          } else if (token.role === 'tenant') {
            const tenants = await sql`SELECT room_id FROM tenants WHERE user_id = ${parseInt(user.id as string)} LIMIT 1`;
            if (tenants.length > 0) {
              const rooms = await sql`SELECT dorm_id FROM rooms WHERE id = ${tenants[0].room_id} LIMIT 1`;
              if (rooms.length > 0) token.dorm_id = rooms[0].dorm_id;
            }
          }
        } catch (e) {
          console.error('[JWT Initial Dorm Fetch Error]', e);
        }
      } else {
        // Dynamic Role & Dorm Refresh
        if (token.id && token.email) {
          try {
            const users = await sql`SELECT role, sub_role FROM users WHERE id = ${parseInt(token.id as string)}`;
            if (users.length > 0) {
              token.role = users[0].role;
              token.sub_role = users[0].sub_role;

              // Refresh dorm_id as well
              if (token.role === 'owner') {
                const dorms = await sql`SELECT id FROM dormitory_profile WHERE owner_id = ${parseInt(token.id as string)} LIMIT 1`;
                if (dorms.length > 0) token.dorm_id = dorms[0].id;
              } else if (token.role === 'keeper') {
                const keepers = await sql`SELECT dorm_id FROM keepers WHERE user_id = ${parseInt(token.id as string)} LIMIT 1`;
                if (keepers.length > 0) token.dorm_id = keepers[0].dorm_id;
              }
            }
          } catch (e) {
            console.error('[JWT Refresh Error]', e);
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).role = token.role;
        (session.user as any).sub_role = token.sub_role;
        (session.user as any).dorm_id = token.dorm_id;
        session.user.name = token.name;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // By default redirect based on role isn't easy here without token in this scope, wait... JWT token is usually not available in redirect callback.
      // But we can check url in next middleware or rely on the frontend redirect in signIn route.
      // The signIn function in app/signin/page.tsx resolves after auth, and then NextAuth can redirect. 
      // Actually we will handle role-based redirect in middleware or the frontend after login.
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
});
