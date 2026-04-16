import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dormId, billingCycle, dueDate, title } = body;

    if (!dormId || !billingCycle || !dueDate) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // 1. Find all active tenants in this dormitory and their current room prices
    const activeTenants = await sql`
      SELECT t.id as tenant_id, r.price as amount
      FROM tenants t
      JOIN rooms r ON t.room_id = r.id
      WHERE r.dorm_id = ${parseInt(dormId)} AND t.status = 'Active'
    `;

    if (activeTenants.length === 0) {
      return NextResponse.json({ success: true, message: 'No active tenants found', count: 0 });
    }

    // 2. Batch insert bills
    // We'll map through tenants and create insertion promises
    // In a production environment with many tenants, a single multi-row INSERT would be better.
    // Here we'll do it for clarity.
    
    let createdCount = 0;
    for (const tenant of activeTenants) {
      // Check if bill already exists for this tenant and cycle to avoid duplicates
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
    console.error('[Batch Billing API Error]:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
