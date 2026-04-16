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
    
    // Join tenants with rooms and contracts to get a full picture
    const result = await sql`
      SELECT 
        r.room_number,
        r.room_type,
        r.price,
        r.floor,
        c.start_date,
        c.end_date,
        c.deposit_amount,
        c.status as contract_status,
        d.name as dorm_name,
        d.address as dorm_address
      FROM tenants t
      JOIN rooms r ON t.room_id = r.id
      LEFT JOIN contracts c ON t.id = c.tenant_id
      LEFT JOIN dormitory_profile d ON r.dorm_id = d.id
      WHERE t.email = ${session.user.email}
      ORDER BY c.created_at DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Room info not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error('[GET /api/tenant/room] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
