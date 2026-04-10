import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function POST(req: Request) {
  try {
    const session = await auth();
    const data = await req.json();
    const { roomNumber, monthlyRent, depositAmount, startDate, endDate, signatureData } = data;

    // 1. Get room details from roomNumber
    const rooms = await sql`
      SELECT id, status 
      FROM rooms 
      WHERE room_number = ${roomNumber} 
      LIMIT 1
    `;
    
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const roomId = rooms[0].id;

    // 2. Resolve tenant identity
    let tenantId;
    if (session?.user) {
      const userEmail = session.user.email;
      const tenants = await sql`SELECT id FROM tenants WHERE email = ${userEmail} LIMIT 1`;
      
      if (tenants.length > 0) {
        tenantId = tenants[0].id;
      } else {
        // Atomic insert of tenant based on user session
        const newTenants = await sql`
          INSERT INTO tenants (user_id, name, email, status)
          SELECT id, name, email, 'Active'
          FROM users 
          WHERE email = ${userEmail}
          RETURNING id
        `;
        tenantId = newTenants.length > 0 ? newTenants[0].id : null;
      }
    } else {
      // Demo fallback: use the first available tenant if session is missing
      const fallbackTenants = await sql`SELECT id FROM tenants LIMIT 1`;
      tenantId = fallbackTenants.length > 0 ? fallbackTenants[0].id : null;
    }

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant context could not be resolved' }, { status: 400 });
    }

    // 3. Persist contract and update room status atomically
    // We use sequential queries for simplicity with neon-serverless for now, 
    // though a single transaction block is preferred for production.
    try {
      // Save the digital contract
      await sql`
        INSERT INTO contracts (tenant_id, room_id, start_date, end_date, deposit_amount, signature_data, status)
        VALUES (${tenantId}, ${roomId}, ${startDate}, ${endDate}, ${depositAmount}, ${signatureData}, 'Active')
      `;

      // Update room to occupied
      await sql`
        UPDATE rooms 
        SET status = 'Occupied' 
        WHERE id = ${roomId}
      `;

      // Update user role to tenant if they were a guest
      if (session?.user?.email) {
        await sql`
          UPDATE users 
          SET role = 'tenant' 
          WHERE email = ${session.user.email} AND role = 'guest'
        `;
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Contract successfully signed and room status updated' 
      });
    } catch (dbError) {
      console.error('[DB Transaction Error]', dbError);
      return NextResponse.json({ error: 'Failed to complete signing process' }, { status: 500 });
    }

  } catch (error) {
    console.error('[API_CONTRACT_SIGN_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
