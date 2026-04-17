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
    
    return NextResponse.json({ 
      success: true, 
      data: {
        totalRooms: roomsCount[0].count,
        totalTenants: tenantsCount[0].count,
        monthlyIncome: incomeSum[0].total || 0
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
