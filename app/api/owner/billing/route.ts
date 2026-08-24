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
  const dormId = searchParams.get('dormId') || '1';

  try {
    const targetDormId = parseInt(dormId, 10) || 1;
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
      LEFT JOIN tenants t ON b.tenant_id = t.id
      LEFT JOIN rooms r ON r.id = t.room_id
      WHERE b.dorm_id = ${targetDormId} OR r.dorm_id = ${targetDormId}
      ORDER BY b.due_date DESC, b.created_at DESC
    `;
    
    return NextResponse.json({ success: true, data: bills });
  } catch (err: any) {
    console.error('[Billing API] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const sql = getDb();

  try {
    const body = await req.json();
    const { tenant_id, title, amount, billing_cycle, due_date, dorm_id, room_number, water_units, electric_units, water_amount, electric_amount, room_amount } = body;

    if (!tenant_id || !title || !amount || !due_date) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO bills (tenant_id, title, amount, billing_cycle, due_date, status, dorm_id, room_number, water_units, electric_units, water_amount, electric_amount, room_amount)
      VALUES (${tenant_id}, ${title}, ${amount}, ${billing_cycle}, ${due_date}, 'Unpaid', ${dorm_id || 1}, ${room_number || null}, ${water_units || 0}, ${electric_units || 0}, ${water_amount || 0}, ${electric_amount || 0}, ${room_amount || 0})
    `;

    return NextResponse.json({ success: true, data: { id: (result as any).insertId, ...body } });
  } catch (err: any) {
    console.error('[Billing API POST] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
