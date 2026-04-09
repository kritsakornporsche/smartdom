import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      full_name   TEXT        NOT NULL,
      email       TEXT        NOT NULL UNIQUE,
      password    TEXT        NOT NULL,
      role        TEXT        NOT NULL DEFAULT 'tenant'
                  CHECK (role IN ('tenant', 'keeper', 'owner')),
      is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

// GET /api/auth/users — list all users (admin use)
export async function GET() {
  try {
    await ensureTable();

    const users = await sql`
      SELECT id, full_name, email, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `;

    const summary = await sql`
      SELECT
        COUNT(*)                                        AS total,
        COUNT(*) FILTER (WHERE role = 'owner')          AS owners,
        COUNT(*) FILTER (WHERE role = 'keeper')         AS keepers,
        COUNT(*) FILTER (WHERE role = 'tenant')         AS tenants,
        COUNT(*) FILTER (WHERE is_active = TRUE)        AS active
      FROM users
    `;

    return NextResponse.json({
      success: true,
      data: users,
      summary: summary[0],
    });
  } catch (error: any) {
    console.error('[GET /api/auth/users]', error);
    return NextResponse.json(
      { success: false, message: 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้', error: error.message },
      { status: 500 }
    );
  }
}
