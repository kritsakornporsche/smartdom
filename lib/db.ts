/**
 * lib/db.ts
 * Central database connection for SmartDom SaaS Platform
 *
 * Architecture:
 *   Single Database Approach
 *   Data isolation is achieved by filtering queries with `dorm_id`
 */
import { neon } from '@/lib/mysql-adapter';

const MYSQL_BASE = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL.replace(/\/[^\/]+$/, '')
  : 'mysql://smartdom:smartdom@kritsakorn.thddns.net:5994';

// ── Unified Database ─────────────────────────────────────────────────────────
export function getDb() {
  return neon(`${MYSQL_BASE}/smartdomdb`);
}

// ── Fallback exports for gradual migration ────────────────────────────────────
// These are temporarily kept but point to the same unified database
export function getPlatformDb() {
  return getDb();
}

export function getDormDb(dormDbName?: string) {
  return getDb();
}

export function getDormDbFromSession(session: any) {
  if (!session?.user) throw new Error('User not authenticated');
  return getDb();
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SmartDomUser {
  id: string;
  name: string;
  email: string;
  role: 'platform_admin' | 'owner' | 'tenant' | 'keeper' | 'guest';
  sub_role?: string | null;
  dormId?: number | null;
}
