import { NextResponse } from 'next/server';
import { neon } from '@/lib/mysql-adapter';

const MYSQL_BASE = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL.replace(/\/[^\/]+$/, '')
  : 'mysql://smartdom:smartdom@localhost:3306';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dormDbName = searchParams.get('dormDbName');
  // Legacy support: dormId (ignored now, we use dormDbName)

  if (!dormDbName) {
    return NextResponse.json({ success: false, message: 'dormDbName required' }, { status: 400 });
  }

  try {
    const sql = neon(`${MYSQL_BASE}/${dormDbName}`);
    
    const totalRoomsResult = await sql`SELECT COUNT(*) as count FROM rooms`;
    const totalRooms = Number(totalRoomsResult[0].count);

    const occupiedResult = await sql`SELECT COUNT(*) as count FROM rooms WHERE status = 'Occupied'`;
    const occupiedRooms = Number(occupiedResult[0].count);

    const tenantsResult = await sql`SELECT COUNT(*) as count FROM tenants WHERE status = 'Active'`;
    const totalTenants = Number(tenantsResult[0].count);

    const maintResult = await sql`SELECT COUNT(*) as count FROM maintenance_requests WHERE status = 'Pending'`;
    const pendingMaintenance = Number(maintResult[0].count);

    const pendingSlipsResult = await sql`SELECT COUNT(*) as count FROM bills WHERE status = 'Pending'`.catch(() => [{ count: 0 }]);
    const pendingSlips = Number(pendingSlipsResult[0]?.count || 0);

    const unpaidBillsResult = await sql`SELECT COUNT(*) as count FROM bills WHERE status = 'Unpaid'`.catch(() => [{ count: 0 }]);
    const unpaidBills = Number(unpaidBillsResult[0]?.count || 0);

    const pendingContractsResult = await sql`
      SELECT COUNT(*) as count 
      FROM contracts c
      JOIN rooms r ON c.room_id = r.id
      WHERE c.status = 'PendingOwnerSignature'
    `.catch(() => [{ count: 0 }]);

    const pendingDraftsResult = await sql`
      SELECT COUNT(*) as count 
      FROM booking_progress 
      WHERE status IN ('pending', 'awaiting_approval', 'deposit_submitted')
    `.catch(() => [{ count: 0 }]);

    const pendingBookings = Number(pendingContractsResult[0]?.count || 0) + Number(pendingDraftsResult[0]?.count || 0);

    const availableRooms = Math.max(0, totalRooms - occupiedRooms);

    let latestMaintenance = null;
    if (pendingMaintenance > 0) {
      const latest = await sql`SELECT room_number, issue_type, description FROM maintenance_requests WHERE status = 'Pending' ORDER BY id DESC LIMIT 1`;
      if (latest && latest.length > 0) {
        latestMaintenance = {
          roomNumber: latest[0].room_number,
          issueType: latest[0].issue_type,
          description: latest[0].description,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRooms,
        occupiedRooms,
        availableRooms,
        totalTenants,
        pendingMaintenance,
        pendingSlips,
        unpaidBills,
        pendingBookings,
        latestMaintenance,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
