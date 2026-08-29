import { auth } from '@/auth';
import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const sql = getDb();

  const { id } = await params;
  const billId = parseInt(id, 10);
  if (isNaN(billId)) {
    return NextResponse.json({ success: false, message: 'Invalid bill ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status, slip_url, title, amount, due_date } = body;

    if (!status && title === undefined && amount === undefined) {
      return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 });
    }

    if (status) {
      if (slip_url !== undefined) {
        await sql`
          UPDATE bills 
          SET status = ${status}, slip_url = ${slip_url}
          WHERE id = ${billId}
        `;
      } else {
        await sql`
          UPDATE bills 
          SET status = ${status}
          WHERE id = ${billId}
        `;
      }
    }

    if (title !== undefined && amount !== undefined && due_date !== undefined) {
      await sql`
        UPDATE bills 
        SET title = ${title}, amount = ${amount}, due_date = ${due_date}
        WHERE id = ${billId}
      `;
    }

    const updatedBills = await sql`
      SELECT b.*, t.name as tenant_name, COALESCE(b.room_number, r.room_number) as room_number
      FROM bills b
      LEFT JOIN tenants t ON b.tenant_id = t.id
      LEFT JOIN rooms r ON r.id = t.room_id
      WHERE b.id = ${billId}
      LIMIT 1
    `;

    return NextResponse.json({ success: true, data: updatedBills[0] || { id: billId, status } });
  } catch (err: any) {
    console.error('[Billing API PUT] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const sql = getDb();

  const { id } = await params;
  const billId = parseInt(id, 10);
  if (isNaN(billId)) {
    return NextResponse.json({ success: false, message: 'Invalid bill ID' }, { status: 400 });
  }

  try {
    await sql`DELETE FROM bills WHERE id = ${billId}`;
    return NextResponse.json({ success: true, message: 'Bill deleted successfully' });
  } catch (err: any) {
    console.error('[Billing API DELETE] Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

