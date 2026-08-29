import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const sql = getDb();

  try {
    const body = await req.json();
    const { dormId, billingCycle, dueDate, title } = body;

    if (!dormId || !billingCycle || !dueDate) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find all active tenants in this dormitory via their active contracts
    const activeTenants = await sql`
      SELECT t.id as tenant_id, r.price as amount
      FROM tenants t
      JOIN contracts c ON c.tenant_id = t.id
      JOIN rooms r ON c.room_id = r.id
      WHERE r.dorm_id = ${parseInt(dormId)} 
      AND t.status = 'Active'
      AND c.status = 'Active'
    `;

    if (activeTenants.length === 0) {
      return NextResponse.json({ success: true, message: 'No active tenants found', count: 0 });
    }

    let createdCount = 0;
    for (const tenant of activeTenants) {
      const existing = await sql`
        SELECT id FROM bills 
        WHERE tenant_id = ${tenant.tenant_id} AND billing_cycle = ${billingCycle} AND title = ${title}
      `;
      
      if (existing.length === 0) {
        await sql`
          INSERT INTO bills (tenant_id, title, amount, billing_cycle, due_date, status)
          VALUES (${tenant.tenant_id}, ${title}, ${tenant.amount}, ${billingCycle}, ${dueDate}, 'Unpaid')
        `;
        createdCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully generated ${createdCount} bills.`,
      count: createdCount 
    });

  } catch (err: any) {
    console.error('[Billing Batch API] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
