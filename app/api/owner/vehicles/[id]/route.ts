import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

const sql = neon(process.env.DATABASE_URL || '');

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await sql`DELETE FROM vehicles WHERE id = ${parseInt(id)}`;

    return NextResponse.json({ success: true, message: 'Vehicle deleted' });
  } catch (error: any) {
    console.error('[API Vehicles DELETE Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to delete vehicle', error: error.message }, { status: 500 });
  }
}
