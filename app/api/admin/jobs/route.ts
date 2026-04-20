import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Fetch cleaning jobs
    const cleaningJobs = await sql`
      SELECT c.*, r.room_number, u.name as keeper_name
      FROM cleaning_jobs c
      LEFT JOIN rooms r ON c.room_id = r.id
      LEFT JOIN users u ON c.assigned_to = u.id
      ORDER BY c.created_at DESC
    `;
    
    // Fetch maintenance jobs
    const maintenanceJobs = await sql`
      SELECT m.*, r.room_number, u.name as keeper_name
      FROM maintenance_jobs m
      LEFT JOIN rooms r ON m.room_id = r.id
      LEFT JOIN users u ON m.assigned_to = u.id
      ORDER BY m.created_at DESC
    `;
    
    return NextResponse.json({ 
      success: true, 
      data: {
        cleaning: cleaningJobs,
        maintenance: maintenanceJobs
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin jobs:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch jobs', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// API for admin to update status (Approve/Close)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, type, status } = body; // type is 'cleaning' or 'maintenance'
    
    if (!id || !type || !status) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL || '');
    const table = type === 'cleaning' ? 'cleaning_jobs' : 'maintenance_jobs';
    
    const result = await sql`
      UPDATE ${sql(table)}
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json({ success: true, message: 'Status updated successfully', data: result[0] });
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json({ success: false, message: 'Failed to update status' }, { status: 500 });
  }
}
