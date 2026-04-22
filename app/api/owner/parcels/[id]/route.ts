import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

const sql = neon(process.env.DATABASE_URL || '');

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await req.json();

    const picked_up_at = status === 'Picked Up' ? new Date().toISOString() : null;

    const result = await sql`
      UPDATE parcels 
      SET status = ${status}, picked_up_at = ${picked_up_at}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Parcel not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Parcel updated', data: result[0] });
  } catch (error: any) {
    console.error('[API Parcels PATCH Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to update parcel', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await sql`DELETE FROM parcels WHERE id = ${parseInt(id)}`;

    return NextResponse.json({ success: true, message: 'Parcel deleted' });
  } catch (error: any) {
    console.error('[API Parcels DELETE Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to delete parcel', error: error.message }, { status: 500 });
  }
}
