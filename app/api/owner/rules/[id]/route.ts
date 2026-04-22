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
    await sql`DELETE FROM dormitory_rules WHERE id = ${parseInt(id)}`;

    return NextResponse.json({ success: true, message: 'Rule deleted' });
  } catch (error: any) {
    console.error('[API Rules DELETE Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to delete rule', error: error.message }, { status: 500 });
  }
}
