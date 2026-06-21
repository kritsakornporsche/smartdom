/**
 * lib/db.ts
 * Central database connection routing for SmartDom SaaS Platform
 *
 * Architecture:
 *   smartdom_platform  — Platform admin DB (packages, subscriptions, billing)
 *   smartdom_dorm_N    — Per-dormitory DB (rooms, tenants, bills, accounting...)
 */
import { neon } from '@neondatabase/serverless';

const MYSQL_BASE = 'mysql://root:@localhost:3306';

// ── Platform DB ──────────────────────────────────────────────────────────────
export function getPlatformDb() {
  return neon(`${MYSQL_BASE}/smartdom_platform`);
}

// ── Dormitory DB (by db name) ─────────────────────────────────────────────────
export function getDormDb(dormDbName: string) {
  if (!dormDbName) throw new Error('dormDbName is required');
  return neon(`${MYSQL_BASE}/${dormDbName}`);
}

// ── Dormitory DB (from session) ───────────────────────────────────────────────
export function getDormDbFromSession(session: any) {
  const dbName = session?.user?.dormDbName;
  if (!dbName) throw new Error('No dormDbName in session. User may not be associated with a dormitory.');
  return getDormDb(dbName);
}

// ── Helper: generate a safe DB name from dorm name ────────────────────────────
export function generateDormDbName(dormId: number): string {
  return `smartdom_dorm_${dormId}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SmartDomUser {
  id: string;
  name: string;
  email: string;
  role: 'platform_admin' | 'owner' | 'tenant' | 'keeper' | 'guest';
  sub_role?: string | null;
  dormDbName?: string | null;   // e.g. "smartdom_dorm_1" — null for platform admins
  dormId?: number | null;
}
