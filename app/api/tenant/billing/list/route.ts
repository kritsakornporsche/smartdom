import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const userEmail = session?.user?.email || searchParams.get('email');
    const userId = (session?.user as any)?.id || null;

    if (!userEmail && !userId) {
      return NextResponse.json({ success: false, data: [], message: 'Email or User ID required' });
    }

    const sql = getDb();
    
    // Find all bills associated with this user/tenant across any dorms
    const bills = await sql`
      SELECT b.* 
      FROM bills b
      WHERE b.tenant_id IN (
        SELECT t.id FROM tenants t 
        WHERE t.email = ${userEmail || ''} 
           OR t.user_id = ${userId || 0}
           OR t.user_id IN (SELECT u.id FROM users u WHERE u.email = ${userEmail || ''})
      )
      ORDER BY b.id DESC
    `;

    return NextResponse.json({ success: true, data: bills });
  } catch (error: any) {
    console.error('[GET /api/tenant/billing/list] Error:', error);
    return NextResponse.json({ success: false, data: [], message: error.message }, { status: 500 });
  }
}
