import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dormDbName = searchParams.get('dormDbName');

  if (!dormDbName) {
    return NextResponse.json({ success: false, message: 'dormDbName required' }, { status: 400 });
  }

  try {
    const sql = getDb();
    let dormFilter = 1;
    const targetDormId = parseInt(dormDbName, 10);
    if (!isNaN(targetDormId)) {
      dormFilter = targetDormId;
    } else {
      const dormByDb = await sql`SELECT id FROM dormitory_registry WHERE db_name = ${dormDbName} LIMIT 1`;
      if (dormByDb.length > 0) dormFilter = dormByDb[0].id;
    }
    
    const totalRoomsResult = await sql`SELECT COUNT(*) as count FROM rooms WHERE dorm_id = ${dormFilter}`;
    const totalRooms = Number(totalRoomsResult[0]?.count || 0);

    const occupiedResult = await sql`SELECT COUNT(*) as count FROM rooms WHERE dorm_id = ${dormFilter} AND status = 'Occupied'`;
    const occupiedRooms = Number(occupiedResult[0]?.count || 0);

    const tenantsResult = await sql`
      SELECT COUNT(*) as count 
      FROM tenants t
      LEFT JOIN rooms r ON t.room_id = r.id
      WHERE (t.dorm_id = ${dormFilter} OR r.dorm_id = ${dormFilter}) AND t.status = 'Active'
    `.catch(() => [{ count: 0 }]);
    const totalTenants = Number(tenantsResult[0]?.count || 0);

    const maintResult = await sql`
      SELECT COUNT(*) as count 
      FROM maintenance_requests m
      LEFT JOIN rooms r ON m.room_id = r.id
      WHERE (m.dorm_id = ${dormFilter} OR r.dorm_id = ${dormFilter}) AND m.status = 'Pending'
    `.catch(() => [{ count: 0 }]);
    const pendingMaintenance = Number(maintResult[0]?.count || 0);

    const pendingSlipsResult = await sql`
      SELECT COUNT(*) as count 
      FROM bills b
      LEFT JOIN rooms r ON b.room_number = r.room_number AND r.dorm_id = ${dormFilter}
      WHERE (b.dorm_id = ${dormFilter} OR r.dorm_id = ${dormFilter}) AND b.status = 'Pending'
    `.catch(() => [{ count: 0 }]);
    const pendingSlips = Number(pendingSlipsResult[0]?.count || 0);

    const unpaidBillsResult = await sql`
      SELECT COUNT(*) as count 
      FROM bills b
      LEFT JOIN rooms r ON b.room_number = r.room_number AND r.dorm_id = ${dormFilter}
      WHERE (b.dorm_id = ${dormFilter} OR r.dorm_id = ${dormFilter}) AND b.status = 'Unpaid'
    `.catch(() => [{ count: 0 }]);
    const unpaidBills = Number(unpaidBillsResult[0]?.count || 0);

    const pendingContractsResult = await sql`
      SELECT COUNT(*) as count 
      FROM contracts c
      JOIN rooms r ON c.room_id = r.id
      WHERE r.dorm_id = ${dormFilter} AND c.status = 'PendingOwnerSignature'
    `.catch(() => [{ count: 0 }]);

    const pendingDraftsResult = await sql`
      SELECT COUNT(*) as count 
      FROM booking_progress 
      WHERE dorm_id = ${dormFilter} AND status IN ('pending', 'awaiting_approval', 'deposit_submitted')
    `.catch(() => [{ count: 0 }]);

    const pendingBookings = Number(pendingContractsResult[0]?.count || 0) + Number(pendingDraftsResult[0]?.count || 0);
    const availableRooms = Math.max(0, totalRooms - occupiedRooms);

    let latestMaintenance = null;
    if (pendingMaintenance > 0) {
      const latest = await sql`
        SELECT m.room_number, m.issue_type, m.description 
        FROM maintenance_requests m
        LEFT JOIN rooms r ON m.room_id = r.id
        WHERE (m.dorm_id = ${dormFilter} OR r.dorm_id = ${dormFilter}) AND m.status = 'Pending' 
        ORDER BY m.id DESC 
        LIMIT 1
      `;
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
