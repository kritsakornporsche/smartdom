import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // ใช้ auth() แทน authOptions สำหรับ NextAuth v5

export async function POST() {
  const session = await auth();
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL || '');
  const email = session.user.email;

  try {
    // 1. Get user id
    const user = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (user.length === 0) return NextResponse.json({ success: false, message: 'User not found' });
    
    const userId = user[0].id;

    // 2. Find and reset rooms from contracts
    // We search across common tenant linkage patterns
    
    // First, check by user_id in contracts
    const contracts = await sql`SELECT room_id FROM contracts WHERE user_id = ${userId}`;
    
    // Check by tenant_id (if user and tenant are separate tables but linked by email)
    const tenants = await sql`SELECT id FROM tenants WHERE email = ${email}`;
    if (tenants.length > 0) {
      const tenantId = tenants[0].id;
      const tenantContracts = await sql`SELECT room_id FROM contracts WHERE tenant_id = ${tenantId}`;
      
      for (const contract of tenantContracts) {
        await sql`UPDATE rooms SET status = 'Available' WHERE id = ${contract.room_id}`;
      }
      
      // Clear bills and maintenance for this tenant as well
      await sql`DELETE FROM bills WHERE tenant_id = ${tenantId}`;
      await sql`DELETE FROM maintenance_requests WHERE tenant_id = ${tenantId}`;
    }

    for (const contract of contracts) {
      await sql`UPDATE rooms SET status = 'Available' WHERE id = ${contract.room_id}`;
    }

    // 3. Delete contracts for this user/tenant
    if (tenants.length > 0) {
      await sql`DELETE FROM contracts WHERE tenant_id = ${tenants[0].id}`;
    }
    await sql`DELETE FROM contracts WHERE user_id = ${userId}`;

    // 4. Delete booking progress
    await sql`DELETE FROM booking_progress WHERE user_id = ${userId}`;

    // 5. Update role to guest
    await sql`UPDATE users SET role = 'guest' WHERE id = ${userId}`;

    return NextResponse.json({ 
      success: true, 
      message: 'ย้ายออกเรียบร้อยแล้ว (ระบบคืนสถานะเป็น Guest)' 
    });
  } catch (error: any) {
    console.error('Move out test error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
