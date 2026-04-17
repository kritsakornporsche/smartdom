import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { newRole } = await request.json();
    if (!['tenant', 'guest'].includes(newRole)) {
       return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    await sql`
      UPDATE users 
      SET role = ${newRole} 
      WHERE email = ${session.user.email}
    `;

    return NextResponse.json({ success: true, message: 'Role updated successfully' });
  } catch (error: any) {
    console.error('[Update Role Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
