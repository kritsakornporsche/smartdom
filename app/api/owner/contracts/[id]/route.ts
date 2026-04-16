import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing contract ID' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    const data = await sql`
      SELECT 
        c.*,
        t.name as tenant_name,
        t.email as tenant_email,
        r.room_number,
        r.price as room_price
      FROM contracts c
      JOIN tenants t ON c.tenant_id = t.id
      JOIN rooms r ON c.room_id = r.id
      WHERE c.id = ${id}
    `;

    if (data.length === 0) {
      return NextResponse.json({ success: false, message: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error: any) {
    console.error('[API Contract GET Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
