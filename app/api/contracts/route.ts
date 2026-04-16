import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, signature, startDate, endDate, depositAmount, monthlyRent, tenantName } = await req.json();
    const sql = neon(process.env.DATABASE_URL || '');

    // 1. Resolve tenant identity (Create if missing)
    const userEmail = session.user.email;
    const resolvedTenants = await sql`
      INSERT INTO tenants (name, email, status)
      VALUES (${tenantName || session.user.name}, ${userEmail}, 'Active')
      ON CONFLICT (email) DO UPDATE 
      SET name = COALESCE(EXCLUDED.name, tenants.name)
      RETURNING id
    `;
    const tenantId = resolvedTenants.length > 0 ? resolvedTenants[0].id : null;

    if (!tenantId) {
      return NextResponse.json({ success: false, message: 'Failed to resolve tenant identity' }, { status: 400 });
    }

    // 2. Create Contract record
    const contractRes = await sql`
      INSERT INTO contracts (
        tenant_id, 
        room_id, 
        start_date, 
        end_date, 
        deposit_amount, 
        signature_data, 
        status
      ) VALUES (
        ${tenantId}, 
        ${roomId}, 
        ${startDate}, 
        ${endDate}, 
        ${depositAmount}, 
        ${signature}, 
        'PendingOwnerSignature'
      ) RETURNING id
    `;

    // 3. Update room status to Reserved
    await sql`UPDATE rooms SET status = 'Reserved' WHERE id = ${roomId}`;

    // Note: User role is explicitly NOT upgraded here. 
    // They must wait for the owner to sign the contract.

    return NextResponse.json({ 
      success: true, 
      message: 'Contract signed successfully',
      contractId: contractRes[0].id 
    });

  } catch (error: any) {
    console.error('[API Contracts POST Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
