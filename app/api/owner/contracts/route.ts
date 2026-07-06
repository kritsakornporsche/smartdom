import { auth } from '@/auth';
import { getDormDbFromSession } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function GET(req: Request) {
    const session = await auth();
  if (!session || !(session.user as any)?.dormDbName) return new Response(JSON.stringify({ success: false, message: 'Unauthorized or missing dormDbName' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const sql = getDormDbFromSession(session);

const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  if (!dormId) {
    return NextResponse.json({ success: false, message: 'Dorm ID is required' }, { status: 400 });
  }

  try {
    
    
    // Fetch all contracts for this dormitory
    const contracts = await sql`
      SELECT 
        c.id, 
        c.start_date, 
        c.end_date, 
        c.deposit_amount, 
        c.status, 
        c.created_at,
        c.signature_data,
        t.name as tenant_name,
        t.email as tenant_email,
        r.room_number,
        r.room_type,
        r.price as monthly_rent
      FROM contracts c
      JOIN tenants t ON c.tenant_id = t.id
      JOIN rooms r ON c.room_id = r.id
      WHERE r.dorm_id = ${parseInt(dormId)}
      ORDER BY c.created_at DESC
    `;
    
    return NextResponse.json({ success: true, data: contracts });
  } catch (err: any) {
    console.error('[Contracts API] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
    const session = await auth();
  if (!session || !(session.user as any)?.dormDbName) return new Response(JSON.stringify({ success: false, message: 'Unauthorized or missing dormDbName' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const sql = getDormDbFromSession(session);

try {
    const body = await req.json();
    const { tenant_id, room_id, start_date, end_date, deposit_amount } = body;

    if (!tenant_id || !room_id || !start_date || !end_date) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    
    
    // 1. Create the contract (status 'Pending Signature' by default if we want automation)
    // Actually table default was 'Active', but for automation we want them to sign.
    // Let's use 'Pending' as a status for automation flow.
    const result = await sql`
      INSERT INTO contracts (tenant_id, room_id, start_date, end_date, deposit_amount, status)
      VALUES (${tenant_id}, ${room_id}, ${start_date}, ${end_date}, ${deposit_amount}, 'Pending')
      RETURNING *
    `;

    // 2. Optionally update room status (but usually we do this when they SIGN)
    // For now we'll keep it as is.

    return NextResponse.json({ success: true, data: result[0] });
  } catch (err: any) {
    console.error('[Contracts API POST] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
