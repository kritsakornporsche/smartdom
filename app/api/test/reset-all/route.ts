import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST() {
  const session = await auth();
  
  // Only allow if logged in (you might want to check for owner role in a real app, 
  // but for testing we'll allow identifying users)
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL || '');

  try {
    // 1. Reset ALL rooms to Available
    await sql`UPDATE rooms SET status = 'Available'`;

    // 2. Delete ALL booking related history
    await sql`DELETE FROM contracts`;
    await sql`DELETE FROM booking_progress`;
    await sql`DELETE FROM bills`;
    await sql`DELETE FROM maintenance_requests`;
    
    // 3. Reset ALL tenants back to guests
    // We keep 'owner' and 'admin' roles intact
    await sql`UPDATE users SET role = 'guest' WHERE role = 'tenant'`;

    // 4. Optionally clear tenants table if it exists as a separate entity
    try {
      await sql`DELETE FROM tenants`;
    } catch (e) {
      // Table might not exist or have different name
    }

    return NextResponse.json({ 
      success: true, 
      message: 'รีเซ็ตระบบทั้งหมดเรียบร้อยแล้ว: ห้องพักทุกห้องสถานะว่าง และล้างประวัติการเช่าทั้งหมด' 
    });
  } catch (error: any) {
    console.error('Reset all test error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
