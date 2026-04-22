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
    const transactions = await sql`
      SELECT * FROM accounting_transactions 
      WHERE dorm_id = ${parseInt(dormId)}
      ORDER BY transaction_date DESC, id DESC
    `;
    
    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    console.error('[API Accounting GET Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch transactions', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { dorm_id, transaction_type, category, amount, description, transaction_date } = body;

    if (!dorm_id || !transaction_type || !category || amount === undefined) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO accounting_transactions (dorm_id, transaction_type, category, amount, description, transaction_date)
      VALUES (${dorm_id}, ${transaction_type}, ${category}, ${amount}, ${description}, ${transaction_date || new Date().toISOString().split('T')[0]})
      RETURNING *
    `;

    return NextResponse.json({ success: true, message: 'Transaction recorded', data: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('[API Accounting POST Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to record transaction', error: error.message }, { status: 500 });
  }
}
