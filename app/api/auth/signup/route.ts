import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';


// ─── POST /api/auth/signup ─────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, password, role = 'guest', sub_role = null } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, นามสกุล, อีเมล, รหัสผ่าน)' },
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

    const sql = getDb();

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
    const fullName = `${first_name.trim()} ${last_name.trim()}`;
    const result = await sql`
      INSERT INTO users (name, first_name, last_name, email, password, primary_role)
      VALUES (
        ${fullName},
        ${first_name.trim()},
        ${last_name.trim()},
        ${email.toLowerCase().trim()},
        ${hashedPassword},
        ${role}
      )
    `;
    
    // In mysql, INSERT returns an object with insertId, not RETURNING rows
    const insertId = result.insertId;

    return NextResponse.json(
      {
        success: true,
        message: 'สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ SmartDom',
        data: {
          id: insertId,
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          full_name: fullName,
          email: email.toLowerCase().trim(),
          role: role,
          sub_role: role === 'keeper' ? sub_role : null,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/auth/signup] Error:', error);

    // Handle unique constraint violation gracefully
    if (error.code === 'ER_DUP_ENTRY') {
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

    const sql = getDb();

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
