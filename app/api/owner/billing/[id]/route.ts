import { auth } from '@/auth';
import { getDormDbFromSession } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
  if (!session || !(session.user as any)?.dormDbName) return new Response(JSON.stringify({ success: false, message: 'Unauthorized or missing dormDbName' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const sql = getDormDbFromSession(session);

const { id } = await params;
  try {
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 });
    }

    
    
    const result = await sql`
      UPDATE bills 
      SET status = ${status}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (err: any) {
    console.error('[Billing API PUT] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
  if (!session || !(session.user as any)?.dormDbName) return new Response(JSON.stringify({ success: false, message: 'Unauthorized or missing dormDbName' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  const sql = getDormDbFromSession(session);

const { id } = await params;
  try {
    
    
    await sql`DELETE FROM bills WHERE id = ${parseInt(id)}`;
    
    return NextResponse.json({ success: true, message: 'Bill deleted successfully' });
  } catch (err: any) {
    console.error('[Billing API DELETE] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
