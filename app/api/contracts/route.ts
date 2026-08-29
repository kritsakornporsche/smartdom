import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const sql = getDb();

  try {
    const { 
      roomId, 
      signature, 
      startDate, 
      endDate, 
      depositAmount, 
      monthlyRent, 
      tenantName,
      slipUrl 
    } = await req.json();

    if (!roomId) {
      return NextResponse.json({ success: false, message: 'Room ID is required' }, { status: 400 });
    }

    // 1. Resolve tenant identity (find existing or create new)
    const userEmail = session.user.email;
    let tenants = await sql`SELECT id FROM tenants WHERE email = ${userEmail} LIMIT 1`;
    let tenantId: number;

    if (tenants.length > 0) {
      tenantId = tenants[0].id;
      if (tenantName) {
        await sql`UPDATE tenants SET name = ${tenantName} WHERE id = ${tenantId}`;
      }
    } else {
      await sql`
        INSERT INTO tenants (name, email, status)
        VALUES (${tenantName || session.user.name || 'Tenant'}, ${userEmail}, 'Active')
      `;
      const created = await sql`SELECT id FROM tenants WHERE email = ${userEmail} ORDER BY id DESC LIMIT 1`;
      if (!created || created.length === 0) {
        return NextResponse.json({ success: false, message: 'Failed to create tenant record' }, { status: 500 });
      }
      tenantId = created[0].id;
    }

    // 2. Create Contract record with slipUrl
    await sql`
      INSERT INTO contracts (
        tenant_id, 
        room_id, 
        start_date, 
        end_date, 
        deposit_amount, 
        signature_data, 
        slip_url,
        status
      ) VALUES (
        ${tenantId}, 
        ${roomId}, 
        ${startDate}, 
        ${endDate}, 
        ${depositAmount}, 
        ${signature || 'CONFIRMED_E_CONTRACT'}, 
        ${slipUrl || null},
        'PendingOwnerSignature'
      )
    `;

    const contracts = await sql`
      SELECT id FROM contracts 
      WHERE tenant_id = ${tenantId} AND room_id = ${roomId} 
      ORDER BY id DESC LIMIT 1
    `;
    const contractId = contracts.length > 0 ? contracts[0].id : null;

    // 3. Update room status to Reserved
    await sql`UPDATE rooms SET status = 'Reserved' WHERE id = ${roomId}`;

    return NextResponse.json({ 
      success: true, 
      message: 'Contract and payment slip submitted successfully',
      contractId: contractId
    });

  } catch (error: any) {
    console.error('[API Contracts POST Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
