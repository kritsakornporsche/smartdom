import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const userEmail = session?.user?.email || searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json({ success: false, data: [], message: 'Email required' });
    }

    const sql = getDb();
    
    // Find tenant ID by email or user_id
    const tenantRes = await sql`
      SELECT id, dorm_id, room_id FROM tenants 
      WHERE email = ${userEmail} 
      LIMIT 1
    `;

    if (tenantRes.length === 0) {
      // Also check by users table
      const userRes = await sql`SELECT id FROM users WHERE email = ${userEmail} LIMIT 1`;
      if (userRes.length > 0) {
        const userId = userRes[0].id;
        const tenantByUserId = await sql`SELECT id, dorm_id, room_id FROM tenants WHERE user_id = ${userId} LIMIT 1`;
        if (tenantByUserId.length > 0) {
          const tenantId = tenantByUserId[0].id;
          const bills = await sql`
            SELECT * FROM bills 
            WHERE tenant_id = ${tenantId} 
            ORDER BY id DESC
          `;
          return NextResponse.json({ success: true, data: bills });
        }
      }
      return NextResponse.json({ success: true, data: [] });
    }

    const tenantId = tenantRes[0].id;

    const result = await sql`
      SELECT * FROM bills 
      WHERE tenant_id = ${tenantId} 
      ORDER BY id DESC
    `;

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[GET /api/tenant/billing/list] Error:', error);
    return NextResponse.json({ success: false, data: [], message: error.message }, { status: 500 });
  }
}
