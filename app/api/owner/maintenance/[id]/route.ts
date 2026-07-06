import { auth } from '@/auth';
import { getDormDbFromSession } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
  if (!session || !(session.user as any)?.dormDbName) return new Response(JSON.stringify({ success: false, message: 'Unauthorized or missing dormDbName' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const sql = getDormDbFromSession(session);

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
