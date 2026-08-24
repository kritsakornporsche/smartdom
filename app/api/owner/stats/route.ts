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
      data: { totalRooms, occupiedRooms, totalTenants, pendingMaintenance, latestMaintenance },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
