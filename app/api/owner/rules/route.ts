import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  if (!dormId) {
    return NextResponse.json({ success: false, message: 'Dormitory ID required' }, { status: 400 });
  }

  try {
    const rules = await sql`
      SELECT * FROM dormitory_rules 
      WHERE dorm_id = ${parseInt(dormId)}
      ORDER BY order_index ASC, id ASC
    `;
    
    return NextResponse.json({ success: true, data: rules });
  } catch (error: any) {
    console.error('[API Rules GET Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch rules', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { dorm_id, title, content, order_index } = body;

    if (!dorm_id || !title) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO dormitory_rules (dorm_id, title, content, order_index)
      VALUES (${dorm_id}, ${title}, ${content}, ${order_index || 0})
      RETURNING *
    `;

    return NextResponse.json({ success: true, message: 'Rule added', data: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('[API Rules POST Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to add rule', error: error.message }, { status: 500 });
  }
}
