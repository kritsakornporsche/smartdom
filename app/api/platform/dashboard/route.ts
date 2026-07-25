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
    const [totalSubs] = await platformSql`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'Active'`;
    
    const [monthRevenue] = await platformSql`
      SELECT COALESCE(SUM(amount_paid), 0) as total FROM subscriptions
      WHERE MONTH(start_date) = MONTH(NOW()) AND YEAR(start_date) = YEAR(NOW())
    `;
    const [totalRevenue] = await platformSql`
      SELECT COALESCE(SUM(amount_paid), 0) as total FROM subscriptions
    `;
    const packageBreakdown = await platformSql`
      SELECT p.name, COUNT(s.id) as count
      FROM subscriptions s
      JOIN packages p ON s.package_id = p.id
      WHERE s.status = 'Active'
      GROUP BY p.id, p.name
    `;
    const recentDorms = await platformSql`
      SELECT d.id, d.dorm_name, COALESCE(u.name, 'ไม่ระบุ') as owner_name, d.status, d.created_at
      FROM dormitory_registry d
      LEFT JOIN users u ON d.owner_id = u.id
      ORDER BY d.created_at DESC LIMIT 5
    `;
    const recentSubs = await platformSql`
      SELECT s.id, s.status, s.start_date, s.end_date, s.amount_paid,
             d.dorm_name, p.name as package_name
      FROM subscriptions s
      JOIN dormitory_registry d ON s.dormitory_id = d.id
      JOIN packages p ON s.package_id = p.id
      ORDER BY s.created_at DESC LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      stats: {
        totalDorms: Number(totalDorms?.count || 0),
        activeSubs: Number(totalSubs?.count || 0),
        monthRevenue: Number(monthRevenue?.total || 0),
        totalRevenue: Number(totalRevenue?.total || 0),
      },
      packageBreakdown,
      recentDorms,
      recentSubs,
    });
  } catch (err: any) {
    console.error('GET /api/platform/dashboard error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
