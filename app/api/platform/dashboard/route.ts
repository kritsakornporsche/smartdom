import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const platformSql = neon('mysql://root:@localhost:3306/smartdom_platform');

export async function GET() {
  try {
    const [totalDorms] = await platformSql`SELECT COUNT(*) as count FROM dormitory_registry WHERE status = 'Active'`;
    const [totalSubs] = await platformSql`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'Active'`;
    const [monthRevenue] = await platformSql`
      SELECT COALESCE(SUM(amount), 0) as total FROM platform_accounting
      WHERE type = 'Income' AND MONTH(transaction_date) = MONTH(NOW()) AND YEAR(transaction_date) = YEAR(NOW())
    `;
    const [totalRevenue] = await platformSql`
      SELECT COALESCE(SUM(amount_paid), 0) as total FROM subscriptions WHERE status != 'Cancelled'
    `;
    const packageBreakdown = await platformSql`
      SELECT p.name, COUNT(s.id) as count
      FROM subscriptions s
      JOIN packages p ON s.package_id = p.id
      WHERE s.status = 'Active'
      GROUP BY p.name
    `;
    const recentDorms = await platformSql`
      SELECT id, dorm_name, owner_name, status, created_at
      FROM dormitory_registry
      ORDER BY created_at DESC LIMIT 5
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
        totalDorms: Number(totalDorms.count),
        activeSubs: Number(totalSubs.count),
        monthRevenue: Number(monthRevenue.total),
        totalRevenue: Number(totalRevenue.total),
      },
      packageBreakdown,
      recentDorms,
      recentSubs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
