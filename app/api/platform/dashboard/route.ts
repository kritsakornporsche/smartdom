import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'platform_admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const platformSql = getDb();
    
    const [totalDorms] = await platformSql`SELECT COUNT(*) as count FROM dormitory_registry WHERE status = 'Active'`;
    const [totalTenants] = await platformSql`SELECT COUNT(*) as count FROM tenants WHERE status = 'Active'`;
    const [totalRooms] = await platformSql`SELECT COUNT(*) as count FROM rooms`;
    const [occupiedRooms] = await platformSql`SELECT COUNT(*) as count FROM rooms WHERE status = 'Occupied'`;
    
    const recentDorms = await platformSql`
      SELECT d.id, d.dorm_name, COALESCE(u.name, 'ไม่ระบุ') as owner_name, d.status, d.created_at
      FROM dormitory_registry d
      LEFT JOIN users u ON d.owner_id = u.id
      ORDER BY d.created_at DESC LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      stats: {
        totalDorms: Number(totalDorms?.count || 0),
        totalTenants: Number(totalTenants?.count || 0),
        totalRooms: Number(totalRooms?.count || 0),
        occupiedRooms: Number(occupiedRooms?.count || 0),
      },
      recentDorms,
    });
  } catch (err: any) {
    console.error('GET /api/platform/dashboard error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
