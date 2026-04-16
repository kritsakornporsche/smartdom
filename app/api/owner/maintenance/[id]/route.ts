import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing maintenance ID' }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ success: false, message: 'Missing new status' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    const result = await sql`
      UPDATE maintenance_requests
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] });
  } catch (err: any) {
    console.error('[Maintenance API PUT]', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
