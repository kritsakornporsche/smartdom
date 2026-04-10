import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Get user and their tenant/dorm info
    const result = await sql`
      SELECT 
        u.id as user_id, 
        u.name, 
        u.role,
        t.id as tenant_id,
        r.dorm_id,
        d.name as dorm_name,
        d.owner_id
      FROM users u
      LEFT JOIN tenants t ON u.id = t.user_id
      LEFT JOIN rooms r ON t.room_id = r.id
      LEFT JOIN dormitory_profile d ON r.dorm_id = d.id
      WHERE u.email = ${session.user.email}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error('[GET /api/tenant/me] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
