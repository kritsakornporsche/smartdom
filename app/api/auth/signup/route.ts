import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

// ─── Ensure users table exists ────────────────────────────────────────────────
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

// ─── POST /api/auth/signup ─────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, password, role = 'tenant' } = body;

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
    const validRoles = ['tenant', 'keeper', 'owner'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: 'ประเภทผู้ใช้งานไม่ถูกต้อง' },
        { status: 400 }
      );
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

    // ── Hash password with Web Crypto (no bcrypt needed in Edge/Node) ─────────
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // ── Insert user ───────────────────────────────────────────────────────────
    const result = await sql`
      INSERT INTO users (full_name, email, password, role)
      VALUES (
        ${full_name.trim()},
        ${email.toLowerCase().trim()},
        ${hashedPassword},
        ${role}
      )
      RETURNING id, full_name, email, role, created_at
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
