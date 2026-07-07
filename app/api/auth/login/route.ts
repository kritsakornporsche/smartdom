import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    const emailNorm = email.toLowerCase().trim();
    const sql = getDb();

    const verifyPassword = async (storedHash: string): Promise<boolean> => {
      if (storedHash.startsWith('$2')) return await bcrypt.compare(password, storedHash);
      if (storedHash.length === 64) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(password).digest('hex') === storedHash;
      }
      return password === storedHash;
    };

    // ── 1. Check platform_admins ────────────────────────────────────────────
    try {
      const admins = await sql`
        SELECT id, name, email, password, role FROM platform_admins
        WHERE email = ${emailNorm} AND is_active = TRUE LIMIT 1
      `;
      if (admins.length > 0 && await verifyPassword(admins[0].password)) {
        return NextResponse.json({
          success: true,
          message: 'เข้าสู่ระบบสำเร็จ',
          redirectUrl: '/platform',
          user: { ...admins[0], role: 'platform_admin', dormDbName: null },
        });
      }
    } catch (e) { /* ignore */ }

    // ── 2. Search unified users table ─────────────────────────────────────────
    const users = await sql`
      SELECT u.id, u.name, u.email, u.password, u.primary_role, r.role, r.sub_role, r.dorm_id 
      FROM users u
      LEFT JOIN user_dorm_roles r ON u.id = r.user_id AND r.is_active = TRUE
      WHERE u.email = ${emailNorm} OR u.name = ${emailNorm}
      LIMIT 1
    `;

    if (users.length > 0 && await verifyPassword(users[0].password)) {
      const user = users[0];
      const role = user.role || user.primary_role || 'guest';
      let redirectUrl = '/explore';
      
      if (role === 'owner') redirectUrl = '/owner';
      if (role === 'tenant') redirectUrl = '/tenant';
      if (role === 'keeper') {
        if (user.sub_role === 'maid') redirectUrl = '/keeper/maid';
        else if (user.sub_role === 'technician') redirectUrl = '/keeper/technician';
        else redirectUrl = '/keeper';
      }
      
      return NextResponse.json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        redirectUrl,
        user: { ...user, role, dormId: user.dorm_id },
      });
    }

    return NextResponse.json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด', error: error.message }, { status: 500 });
  }
}
