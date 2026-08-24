import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const sql = getDb();

  const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  try {
    let query;
    if (dormId) {
      const targetDormId = parseInt(dormId, 10) || 1;
      query = await sql`
        SELECT t.id, t.name, t.email, t.phone, t.status, r.room_number
        FROM tenants t
        LEFT JOIN rooms r ON r.id = t.room_id
        WHERE t.dorm_id = ${targetDormId} OR r.dorm_id = ${targetDormId}
        ORDER BY r.room_number ASC
      `;
    } else {
      query = await sql`
        SELECT t.id, t.name, t.email, t.phone, t.status, r.room_number
        FROM tenants t
        LEFT JOIN rooms r ON r.id = t.room_id
        ORDER BY r.room_number ASC
      `;
    }
    
    return NextResponse.json({ success: true, data: query });
  } catch (err: any) {
    console.error('[Tenants API] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
