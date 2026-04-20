import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || '');
    const tenants = await sql`
      SELECT id, name, email, phone, role, created_at 
      FROM users 
      WHERE role = 'tenant' 
      ORDER BY name ASC
    `;
    
    return NextResponse.json({ success: true, data: tenants }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch tenants', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
