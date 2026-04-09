import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // ── Hash password to match signup hashing (SHA-256) ─────────────────────
    const encoder = new TextEncoder();
    const dataArr = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataArr);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check credentials against hashed password
    const users = await sql`
      SELECT id, name, email, role FROM users 
      WHERE email = ${email} AND password = ${hashedPassword}
    `;

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const user = users[0];

    // Read the cookies asynchronously inside Next.js 16/15
    const cookieStore = await cookies();
    cookieStore.set('session_role', user.role, { path: '/', httpOnly: false });
    cookieStore.set('session_user', JSON.stringify({ id: user.id, name: user.name, email: user.email }), { path: '/', httpOnly: false });

    // Determine redirect path based on role
    let redirectUrl = '/';
    if (user.role === 'admin') redirectUrl = '/admin';
    if (user.role === 'tenant') redirectUrl = '/tenant';
    if (user.role === 'keeper') redirectUrl = '/keeper'; // Future placeholder

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
