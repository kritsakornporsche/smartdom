import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  if (!dormId) {
    return NextResponse.json({ success: false, message: 'Dorm ID required' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Count Rooms
    const totalRoomsResult = await sql`SELECT COUNT(*) FROM rooms WHERE dorm_id = ${parseInt(dormId)}`;
    const totalRooms = parseInt(totalRoomsResult[0].count);

    // Count Occupied
    const occupiedResult = await sql`SELECT COUNT(*) FROM rooms WHERE dorm_id = ${parseInt(dormId)} AND status = 'Occupied'`;
    const occupiedRooms = parseInt(occupiedResult[0].count);

    // Count Tenants (joined via rooms)
    const tenantsResult = await sql`
      SELECT COUNT(*) FROM tenants 
      WHERE room_id IN (SELECT id FROM rooms WHERE dorm_id = ${parseInt(dormId)})
    `;
    const totalTenants = parseInt(tenantsResult[0].count);

    return NextResponse.json({
      success: true,
      data: {
        totalRooms,
        occupiedRooms,
        totalTenants,
        pendingMaintenance: 1 // Placeholder for now
      }
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
