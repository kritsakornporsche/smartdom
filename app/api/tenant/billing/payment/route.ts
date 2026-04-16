import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { billId, slipData } = await req.json();
    if (!billId || !slipData) {
      return NextResponse.json({ success: false, message: 'Missing billId or slipData' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Check if bill belongs to current user
    const tenantRes = await sql`SELECT id FROM tenants WHERE email = ${session.user.email}`;
    if (tenantRes.length === 0) return NextResponse.json({ success: false, message: 'Tenant not found' }, { status: 404 });
    const tenantId = tenantRes[0].id;

    // Verify bill
    const billRes = await sql`SELECT id, status FROM bills WHERE id = ${billId} AND tenant_id = ${tenantId}`;
    if (billRes.length === 0) {
      return NextResponse.json({ success: false, message: 'Bill not found or unauthorized' }, { status: 404 });
    }

    if (billRes[0].status !== 'Unpaid') {
      return NextResponse.json({ success: false, message: 'Bill is already paid or pending' }, { status: 400 });
    }

    // Update bill
    await sql`
      UPDATE bills 
      SET status = 'Pending', slip_url = ${slipData} 
      WHERE id = ${billId}
    `;

    return NextResponse.json({ success: true, message: 'Payment submitted successfully' });

  } catch (error: any) {
    console.error('[POST /api/tenant/billing/payment] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
