import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { issue_type, description, image_url } = await request.json();
    if (!description) {
      return NextResponse.json({ success: false, message: 'Description is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Find tenant ID and room_number
    const tenantRes = await sql`
      SELECT t.id, r.room_number 
      FROM tenants t 
      JOIN rooms r ON t.room_id = r.id 
      WHERE t.email = ${session.user.email}
    `;

    if (tenantRes.length === 0) {
      return NextResponse.json({ success: false, message: 'Tenant not found' }, { status: 404 });
    }

    const tenantId = tenantRes[0].id;
    const roomNumber = tenantRes[0].room_number;

    const result = await sql`
      INSERT INTO maintenance_requests (tenant_id, room_number, issue_type, description, image_url, status)
      VALUES (${tenantId}, ${roomNumber}, ${issue_type}, ${description}, ${image_url || null}, 'Pending')
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error('[POST /api/tenant/maintenance] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
