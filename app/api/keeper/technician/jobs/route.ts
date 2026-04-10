import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'keeper' || (session.user as any).sub_role !== 'technician') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Fetch stats
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN urgency = 'rush' AND status != 'completed' THEN 1 ELSE 0 END) as rush_jobs,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM maintenance_jobs
    `;

    // Fetch jobs list
    const jobsResult = await sql`
      SELECT 
        m.id, 
        m.issue,
        m.urgency,
        m.status, 
        m.created_at,
        r.room_number 
      FROM maintenance_jobs m
      JOIN rooms r ON m.room_id = r.id
      ORDER BY 
        CASE 
          WHEN m.urgency = 'rush' THEN 1
          WHEN m.urgency = 'high' THEN 2
          ELSE 3
        END,
        m.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          total: statsResult[0]?.total_jobs || 0,
          rush: statsResult[0]?.rush_jobs || 0,
          completed: statsResult[0]?.completed || 0
        },
        jobs: jobsResult
      }
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'keeper' || (session.user as any).sub_role !== 'technician') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Missing ID or Status' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Update the status of the job
    await sql`
      UPDATE maintenance_jobs 
      SET status = ${status}, updated_at = NOW() 
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, message: 'Job status updated' });
  } catch (error: any) {
    console.error('API Error updating job:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
