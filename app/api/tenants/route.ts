import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  try {
    const sql = neon(process.env.DATABASE_URL || '');
    
    let query;
    if (dormId) {
      // Get tenants who are in rooms belonging to this dormitory
      query = await sql`
        SELECT t.id, t.name, t.email, t.phone, t.status, r.room_number
        FROM tenants t
        JOIN rooms r ON r.id = COALESCE(t.room_id, (SELECT room_id FROM contracts WHERE tenant_id = t.id AND status = 'Active' LIMIT 1))
        WHERE r.dorm_id = ${parseInt(dormId)}
        ORDER BY r.room_number ASC
      `;
    } else {
      query = await sql`
        SELECT t.id, t.name, t.email, t.phone, t.status, r.room_number
        FROM tenants t
        LEFT JOIN rooms r ON r.id = COALESCE(t.room_id, (SELECT room_id FROM contracts WHERE tenant_id = t.id AND status = 'Active' LIMIT 1))
        ORDER BY r.room_number ASC
      `;
    }
    
    return NextResponse.json({ success: true, data: query });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
