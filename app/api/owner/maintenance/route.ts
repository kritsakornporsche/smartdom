import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDormDbFromSession } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'owner' || !(session.user as any).dormDbName) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const sql = getDormDbFromSession(session);
    
    const targetDormId = parseInt((session.user as any).dormId, 10);
    if (!targetDormId) {
      return NextResponse.json({ success: false, message: 'Owner has no dormitory assigned' }, { status: 400 });
    }
    
    const requests = await sql`
      SELECT m.*, t.id_card_number as tenant_id_card
      FROM maintenance_requests m
      LEFT JOIN tenants t ON m.tenant_id = t.id
      WHERE m.dorm_id = ${targetDormId}
      ORDER BY 
        CASE 
          WHEN m.status = 'Pending' THEN 1
          WHEN m.status = 'InProgress' THEN 2
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
