import { auth } from '@/auth';
import { getDormDbFromSession } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function GET(req: Request) {
    const session = await auth();
  if (!session || !(session.user as any)?.dormDbName) return new Response(JSON.stringify({ success: false, message: 'Unauthorized or missing dormDbName' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const sql = getDormDbFromSession(session);

const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  try {
    
    
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
