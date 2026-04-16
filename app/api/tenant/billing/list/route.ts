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
    
    // Find tenant ID
    const tenantRes = await sql`SELECT id FROM tenants WHERE email = ${session.user.email}`;
    if (tenantRes.length === 0) {
      return NextResponse.json({ success: false, data: [] });
    }

    const tenantId = tenantRes[0].id;

    const result = await sql`
      SELECT * FROM bills 
      WHERE tenant_id = ${tenantId} 
      ORDER BY due_date DESC
    `;

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[GET /api/tenant/billing/list] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
