import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  if (!dormId) {
    return NextResponse.json({ success: false, message: 'Dorm ID is required' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Fetch all bills for tenants in this dormitory
    const bills = await sql`
      SELECT 
        b.id, 
        b.title, 
        b.amount, 
        b.billing_cycle, 
        b.due_date, 
        b.status, 
        b.created_at,
        t.name as tenant_name,
        r.room_number
      FROM bills b
      JOIN tenants t ON b.tenant_id = t.id
      JOIN rooms r ON r.id = COALESCE(t.room_id, (SELECT room_id FROM contracts WHERE tenant_id = t.id AND status = 'Active' LIMIT 1))
      WHERE r.dorm_id = ${parseInt(dormId)}
      ORDER BY b.due_date DESC, b.created_at DESC
    `;
    
    return NextResponse.json({ success: true, data: bills });
  } catch (err: any) {
    console.error('[Billing API] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenant_id, title, amount, billing_cycle, due_date } = body;

    if (!tenant_id || !title || !amount || !due_date) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    const result = await sql`
      INSERT INTO bills (tenant_id, title, amount, billing_cycle, due_date, status)
      VALUES (${tenant_id}, ${title}, ${amount}, ${billing_cycle}, ${due_date}, 'Unpaid')
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] });
  } catch (err: any) {
    console.error('[Billing API POST] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
