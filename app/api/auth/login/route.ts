import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Check credentials
    const users = await sql`
      SELECT id, name, email, password, role, sub_role FROM users 
      WHERE email = ${email}
    `;
 
    if (users.length === 0) {
      return NextResponse.json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }
    
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    // Determine redirect path based on role
    let redirectUrl = '/explore';
    if (user.role === 'admin') redirectUrl = '/admin';
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
      user
    }, { status: 200 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', error: error.message }, { status: 500 });
  }
}
