import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { neon } from '@neondatabase/serverless';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    // In production we should verify role is owner here
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { ownerSignatureData } = body;

    if (!ownerSignatureData) {
      return NextResponse.json({ success: false, message: 'Owner signature is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // 1. Get contract and tenant details
    const contracts = await sql`
      SELECT c.room_id, t.email as tenant_email 
      FROM contracts c
      JOIN tenants t ON c.tenant_id = t.id
      WHERE c.id = ${id}
    `;

    if (contracts.length === 0) {
      return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });
    }

    const { room_id, tenant_email } = contracts[0];

    // 2. Update contract status to Active and save owner signature
    const updateContract = await sql`
      UPDATE contracts 
      SET 
        status = 'Active',
        owner_signature_data = ${ownerSignatureData}
      WHERE id = ${id}
      RETURNING *
    `;

    // 3. Update room status to Occupied
    await sql`
      UPDATE rooms 
      SET status = 'Occupied' 
      WHERE id = ${room_id}
    `;

    // 4. Update user role from 'guest' to 'tenant'
    if (tenant_email) {
      await sql`
        UPDATE users 
        SET role = 'tenant' 
        WHERE email = ${tenant_email} AND role = 'guest'
      `;
    }

    // 5. Update room_id for the tenant record to link them to the room logically
    await sql`
      UPDATE tenants
      SET room_id = ${room_id}
      WHERE email = ${tenant_email}
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Contract approved successfully',
      data: updateContract[0]
    });
  } catch (err: any) {
    console.error('[Owner Contract Sign Error]', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
