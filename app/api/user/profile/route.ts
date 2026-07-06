import { NextResponse } from 'next/server';
import { getDormDbFromSession, getPlatformDb } from '@/lib/db';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let sql;
    if ((session.user as any).role === 'platform_admin') {
      sql = getPlatformDb();
    } else {
      sql = getDormDbFromSession(session);
    }
    
    const userResult = await sql`
      SELECT id, email, name, role, created_at, image_url, phone, bio
      FROM users
      WHERE email = ${session.user.email}
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: userResult[0] });
  } catch (error: any) {
    console.error('Profile GET Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, bio, image_url, password } = await request.json();
    
    let sql;
    if ((session.user as any).role === 'platform_admin') {
      sql = getPlatformDb();
    } else {
      sql = getDormDbFromSession(session);
    }

    // If password is being updated
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await sql`
        UPDATE users 
        SET name = ${name}, phone = ${phone}, bio = ${bio}, image_url = ${image_url}, password = ${hashedPassword}
        WHERE email = ${session.user.email}
      `;
    } else {
      await sql`
        UPDATE users 
        SET name = ${name}, phone = ${phone}, bio = ${bio}, image_url = ${image_url}
        WHERE email = ${session.user.email}
      `;
    }

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (error: any) {
    console.error('Profile PATCH Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
