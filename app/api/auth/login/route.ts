import { NextResponse } from 'next/server';
import { neon } from '@/lib/mysql-adapter';
import bcrypt from 'bcryptjs';

const MYSQL_BASE = 'mysql://smartdom:smartdom@kritsakorn.thddns.net:5994';
const platformSql = neon(`${MYSQL_BASE}/smartdom_platform`);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    const emailNorm = email.toLowerCase().trim();

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
      const admins = await platformSql`
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

    // ── 2. Search dorm DBs ──────────────────────────────────────────────────
    const allDorms = await platformSql`
      SELECT id, db_name FROM dormitory_registry WHERE status = 'Active' AND db_name != ''
    `;

    for (const dorm of allDorms) {
      try {
        const dormSql = neon(`${MYSQL_BASE}/${dorm.db_name}`);
        const users = await dormSql`
          SELECT id, name, email, password, role, sub_role FROM users
          WHERE email = ${emailNorm} AND is_active = TRUE LIMIT 1
        `;
        if (users.length > 0 && await verifyPassword(users[0].password)) {
          const user = users[0];
          let redirectUrl = '/explore';
          if (user.role === 'owner') redirectUrl = '/owner';
          if (user.role === 'tenant') redirectUrl = '/tenant';
          if (user.role === 'keeper') {
            if (user.sub_role === 'maid') redirectUrl = '/keeper/maid';
            else if (user.sub_role === 'technician') redirectUrl = '/keeper/technician';
            else redirectUrl = '/keeper';
          }
          return NextResponse.json({
            success: true,
            message: 'เข้าสู่ระบบสำเร็จ',
            redirectUrl,
            user: { ...user, dormDbName: dorm.db_name, dormId: dorm.id },
          });
        }
      } catch { /* DB may not exist */ }
    }

    return NextResponse.json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด', error: error.message }, { status: 500 });
  }
}
