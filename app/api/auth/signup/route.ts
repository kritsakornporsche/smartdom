import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL || '');

// ─── Ensure users table exists ────────────────────────────────────────────────
// ─── Ensure users table & columns exist ──────────────────────────────────────
async function ensureTable() {
  // Create table using the existing schema (column: name, not full_name)
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      email       VARCHAR(255) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      role        VARCHAR(50)  NOT NULL DEFAULT 'guest',
      created_at  TIMESTAMP    DEFAULT NOW()
    )
  `;
  // Add is_active and sub_role columns if they don't exist yet (safe migration)
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS sub_role VARCHAR(50)
  `;
}

// ─── POST /api/auth/signup ─────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, password, role = 'guest', sub_role = null } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, อีเมล, รหัสผ่าน)' },
        { status: 400 }
      );
    }

    // ── Validate email format ─────────────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ── Validate password strength ────────────────────────────────────────────
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' },
        { status: 400 }
      );
    }

    // ── Validate role ─────────────────────────────────────────────────────────
    const validRoles = ['guest', 'tenant', 'keeper', 'owner'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: 'ประเภทผู้ใช้งานไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    if (role === 'keeper') {
      const validSubRoles = ['maid', 'technician'];
      if (!validSubRoles.includes(sub_role)) {
        return NextResponse.json(
          { success: false, message: 'กรุณาระบุประเภทบุคลากรให้ถูกต้อง (แม่บ้าน หรือ ช่างซ่อม)' },
          { status: 400 }
        );
      }
    }

    await ensureTable();

    // ── Check duplicate email ─────────────────────────────────────────────────
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}
    `;
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น' },
        { status: 409 }
      );
    }

    // ── Hash password with BCrypt ─────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Insert user (use 'name' column to match existing DB schema) ───────────
    const result = await sql`
      INSERT INTO users (name, email, password, role, sub_role)
      VALUES (
        ${full_name.trim()},
        ${email.toLowerCase().trim()},
        ${hashedPassword},
        ${role},
        ${role === 'keeper' ? sub_role : null}
      )
      RETURNING id, name AS full_name, email, role, sub_role, created_at
    `;

    const user = result[0];

    return NextResponse.json(
      {
        success: true,
        message: 'สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ SmartDom',
        data: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          sub_role: user.sub_role,
          created_at: user.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/auth/signup] Error:', error);

    // Handle unique constraint violation gracefully
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง', error: error.message },
      { status: 500 }
    );
  }
}

// ─── GET /api/auth/signup?email=xxx — check email availability ────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุอีเมล' },
        { status: 400 }
      );
    }

    await ensureTable();

    const existing = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}
    `;

    return NextResponse.json({
      success: true,
      available: existing.length === 0,
      message: existing.length === 0 ? 'อีเมลนี้พร้อมใช้งาน' : 'อีเมลนี้ถูกใช้งานแล้ว',
    });
  } catch (error: any) {
    console.error('[GET /api/auth/signup] Error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ', error: error.message },
      { status: 500 }
    );
  }
}
