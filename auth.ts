import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import GitHub from 'next-auth/providers/github';
import Line from 'next-auth/providers/line';
import Credentials from 'next-auth/providers/credentials';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';






export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  ...authConfig,
  secret: process.env.AUTH_SECRET || 'A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8',


  providers: [
    ...(process.env.GOOGLE_CLIENT_ID ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })] : []),
    ...(process.env.FACEBOOK_CLIENT_ID ? [Facebook({ clientId: process.env.FACEBOOK_CLIENT_ID, clientSecret: process.env.FACEBOOK_CLIENT_SECRET! })] : []),
    ...(process.env.GITHUB_CLIENT_ID ? [GitHub({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET! })] : []),
    ...(process.env.LINE_CLIENT_ID ? [Line({ clientId: process.env.LINE_CLIENT_ID, clientSecret: process.env.LINE_CLIENT_SECRET! })] : []),

    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);
        const sql = getDb();

        const verifyPassword = async (storedHash: string): Promise<boolean> => {
          if (storedHash.startsWith('$2')) return await bcrypt.compare(password, storedHash);
          if (storedHash.length === 64) {
            const crypto = require('crypto');
            return crypto.createHash('sha256').update(password).digest('hex') === storedHash;
          }
          return password === storedHash;
        };

        // ── 1. Check platform_admins ──────────────────────────────────────────
        try {
          const admins = await sql`
            SELECT id, name, email, password, role FROM platform_admins
            WHERE (email = ${email} OR name = ${email}) AND is_active = TRUE LIMIT 1
          `;
          if (admins.length > 0) {
            const admin = admins[0];
            if (await verifyPassword(admin.password)) {
              return {
                id: `platform_${admin.id}`,
                name: admin.name,
                email: admin.email,
                role: 'platform_admin',
                sub_role: null,
                dormId: null,
              } as any;
            }
          }
        } catch (e) { console.error('[Auth: platform check]', e); }

        // ── 2. Search users and their dorm roles ─────────────────────────────
        try {
          const users = await sql`
            SELECT u.id, u.name, u.email, u.password, u.primary_role, r.role, r.sub_role, r.dorm_id 
            FROM users u
            LEFT JOIN user_dorm_roles r ON u.id = r.user_id AND r.is_active = TRUE
            WHERE (u.email = ${email} OR u.name = ${email}) 
            LIMIT 1
          `;
          
          if (users.length > 0) {
            const user = users[0];
            if (await verifyPassword(user.password)) {
              return {
                id: String(user.id),
                name: user.name,
                email: user.email,
                role: user.role || user.primary_role || 'guest',
                sub_role: user.sub_role,
                dormId: user.dorm_id,
              } as any;
            }
          }
        } catch (e) { console.error('[Auth: user check]', e); }

        return null;
      }
    }),
  ],

  pages: { signIn: '/signin', error: '/signin' },

  callbacks: {
    async signIn() { return true; },

    async jwt({ token, user, account }) {
      if (user) {
        if ((user as any).role) {
          token.role = (user as any).role;
          token.sub_role = (user as any).sub_role || null;
          token.dormId = (user as any).dormId || null;
        } else {
          // OAuth Sign-in: lookup email in unified databases
          const email = user.email?.toLowerCase().trim();
          if (email) {
            const sql = getDb();
            try {
              const admins = await sql`
                SELECT id FROM platform_admins WHERE email = ${email} AND is_active = TRUE LIMIT 1
              `;
              if (admins.length > 0) {
                token.role = 'platform_admin';
                token.sub_role = null;
                token.dormId = null;
              } else {
                const dbUsers = await sql`
                  SELECT u.primary_role, r.role, r.sub_role, r.dorm_id 
                  FROM users u
                  LEFT JOIN user_dorm_roles r ON u.id = r.user_id AND r.is_active = TRUE
                  WHERE u.email = ${email} LIMIT 1
                `;
                if (dbUsers.length > 0) {
                  token.role = dbUsers[0].role || dbUsers[0].primary_role || 'guest';
                  token.sub_role = dbUsers[0].sub_role || null;
                  token.dormId = dbUsers[0].dorm_id || null;
                } else {
                  token.role = 'guest';
                  token.sub_role = null;
                  token.dormId = null;
                }
              }
            } catch (e) {
              console.error('[Auth JWT: OAuth lookup]', e);
            }
          }
        }
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).sub_role = token.sub_role;
        (session.user as any).dormId = token.dormId;
        session.user.name = token.name;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
});



