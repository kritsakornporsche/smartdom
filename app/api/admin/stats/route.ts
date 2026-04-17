import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Get total rooms
    const roomsCount = await sql`SELECT COUNT(*)::int as count FROM rooms`;
    
    // Get total tenants
    const tenantsCount = await sql`SELECT COUNT(*)::int as count FROM users WHERE role = 'tenant'`;
    
    // Get monthly income (sum of price of occupied rooms)
    const incomeSum = await sql`SELECT SUM(price)::float as total FROM rooms WHERE status = 'มีผู้เช่า'`;

    // Get revenue chart data (last 6 months from bills)
    const chartData = await sql`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month, 
        SUM(amount)::float as revenue
      FROM bills
      WHERE created_at > (NOW() - INTERVAL '6 months')
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `;
    
    return NextResponse.json({ 
      success: true, 
      data: {
        totalRooms: roomsCount[0].count,
        totalTenants: tenantsCount[0].count,
        monthlyIncome: incomeSum[0].total || 0,
        revenueHistory: chartData.length > 0 ? chartData : [
          { month: 'Jan', revenue: 45000 },
          { month: 'Feb', revenue: 52000 },
          { month: 'Mar', revenue: 48000 },
          { month: 'Apr', revenue: 60000 }
        ] // Fallback if no bills yet
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch stats', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
