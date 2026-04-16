import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  if (!dormId) return NextResponse.json({ success: false, message: 'Dorm ID required' }, { status: 400 });

  try {
    const sql = neon(process.env.DATABASE_URL || '');
    
    const requests = await sql`
      SELECT m.*, t.name as tenant_name, t.phone as tenant_phone
      FROM maintenance_requests m
      JOIN tenants t ON m.tenant_id = t.id
      JOIN rooms r ON r.id = COALESCE(t.room_id, (SELECT room_id FROM contracts c WHERE c.tenant_id = t.id AND c.status = 'Active' LIMIT 1))
      WHERE r.dorm_id = ${parseInt(dormId)}
      ORDER BY 
        CASE 
          WHEN m.status = 'Pending' THEN 1
          WHEN m.status = 'In Progress' THEN 2
          ELSE 3
        END,
        m.created_at DESC
    `;
    return NextResponse.json({ success: true, data: requests });
  } catch (err: any) {
    console.error('[Maintenance API]', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
