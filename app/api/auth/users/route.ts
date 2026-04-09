import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

async function ensureTable() {
  // Match actual DB schema (column: name, not full_name)
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      email       VARCHAR(255) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      role        VARCHAR(50)  NOT NULL DEFAULT 'tenant',
      created_at  TIMESTAMP    DEFAULT NOW()
    )
  `;
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS sub_role VARCHAR(50)
  `;
}

// GET /api/auth/users — list all users (admin use)
export async function GET() {
  try {
    await ensureTable();

    // Alias 'name' as 'full_name' so the frontend interface stays consistent
    const users = await sql`
      SELECT id, name AS full_name, email, role, sub_role, is_active, created_at
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
