import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'keeper' || (session.user as any).sub_role !== 'maid') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Fetch stats
    const statsResult = await sql`
      SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM cleaning_jobs
      WHERE created_at::date = CURRENT_DATE
    `;

    // Fetch jobs list
    const jobsResult = await sql`
      SELECT 
        c.id, 
        c.status, 
        c.job_type, 
        c.created_at,
        r.room_number 
      FROM cleaning_jobs c
      JOIN rooms r ON c.room_id = r.id
      ORDER BY 
        CASE 
          WHEN c.status = 'pending' THEN 1
          WHEN c.status = 'in_progress' THEN 2
          ELSE 3
        END,
        c.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          total: statsResult[0]?.total_jobs || 0,
          inProgress: statsResult[0]?.in_progress || 0,
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
    if (!session?.user || (session.user as any).role !== 'keeper' || (session.user as any).sub_role !== 'maid') {
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
      UPDATE cleaning_jobs 
      SET status = ${status}, updated_at = NOW() 
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, message: 'Job status updated' });
  } catch (error: any) {
    console.error('API Error updating job:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
