import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import GitHub from 'next-auth/providers/github';
import Line from 'next-auth/providers/line';
import Credentials from 'next-auth/providers/credentials';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

const MYSQL_BASE = 'mysql://root:@localhost:3306';

// Platform DB connection
const platformSql = neon(`${MYSQL_BASE}/smartdom_platform`);

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,

  providers: [
    Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
    Facebook({ clientId: process.env.FACEBOOK_CLIENT_ID!, clientSecret: process.env.FACEBOOK_CLIENT_SECRET! }),
    GitHub({ clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! }),
    Line({ clientId: process.env.LINE_CLIENT_ID!, clientSecret: process.env.LINE_CLIENT_SECRET! }),

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
          const admins = await platformSql`
            SELECT id, name, email, password, role FROM platform_admins
            WHERE email = ${email} AND is_active = TRUE LIMIT 1
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
                dormDbName: null,
                dormId: null,
              } as any;
            }
          }
        } catch (e) { console.error('[Auth: platform check]', e); }

        // ── 2. Search all active dorm DBs ─────────────────────────────────────
        try {
          const allDorms = await platformSql`
            SELECT id, db_name FROM dormitory_registry WHERE status = 'Active' AND db_name != ''
          `;
          for (const dorm of allDorms) {
            try {
              const dormSql = neon(`${MYSQL_BASE}/${dorm.db_name}`);
              const users = await dormSql`
                SELECT id, name, email, password, role, sub_role FROM users
                WHERE email = ${email} AND is_active = TRUE LIMIT 1
              `;
              if (users.length > 0) {
                const user = users[0];
                if (await verifyPassword(user.password)) {
                  return {
                    id: String(user.id),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    sub_role: user.sub_role,
                    dormDbName: dorm.db_name,
                    dormId: dorm.id,
                  } as any;
                }
              }
            } catch { /* DB may not exist, skip */ }
          }
        } catch (e) { console.error('[Auth: search dorms]', e); }

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
          token.dormDbName = (user as any).dormDbName || null;
          token.dormId = (user as any).dormId || null;
        } else {
          // OAuth Sign-in: lookup email in databases
          const email = user.email?.toLowerCase().trim();
          if (email) {
            try {
              const admins = await platformSql`
                SELECT id FROM platform_admins WHERE email = ${email} AND is_active = TRUE LIMIT 1
              `;
              if (admins.length > 0) {
                token.role = 'platform_admin';
                token.sub_role = null;
                token.dormDbName = null;
                token.dormId = null;
              } else {
                const allDorms = await platformSql`
                  SELECT id, db_name FROM dormitory_registry WHERE status = 'Active' AND db_name != ''
                `;
                let found = false;
                for (const dorm of allDorms) {
                  try {
                    const dormSql = neon(`${MYSQL_BASE}/${dorm.db_name}`);
                    const dbUsers = await dormSql`
                      SELECT role, sub_role FROM users WHERE email = ${email} AND is_active = TRUE LIMIT 1
                    `;
                    if (dbUsers.length > 0) {
                      token.role = dbUsers[0].role;
                      token.sub_role = dbUsers[0].sub_role || null;
                      token.dormDbName = dorm.db_name;
                      token.dormId = dorm.id;
                      found = true;
                      break;
                    }
                  } catch { /* skip */ }
                }
                if (!found) {
                  token.role = 'guest';
                  token.sub_role = null;
                  token.dormDbName = null;
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
        (session.user as any).dormDbName = token.dormDbName;
        (session.user as any).dormId = token.dormId;
        session.user.name = token.name;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
});
