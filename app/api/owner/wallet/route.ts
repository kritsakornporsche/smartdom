import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  if (!dormId) return NextResponse.json({ success: false, message: 'Missing dormId' }, { status: 400 });

  try {
    const sql = getDb();
    const reg = await sql`SELECT coins FROM dormitory_registry WHERE id = ${dormId} LIMIT 1`;
    const transactions = await sql`
      SELECT * FROM coin_transactions 
      WHERE dormitory_id = ${dormId} 
      ORDER BY created_at DESC LIMIT 50
    `;

    return NextResponse.json({
      success: true,
      coins: reg.length > 0 ? reg[0].coins : 0,
      transactions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { dormId, amount } = await req.json();
    if (!dormId || !amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid top-up request' }, { status: 400 });
    }

    const sql = getDb();

    // 1. Add coins to dormitory
    await sql`
      UPDATE dormitory_registry SET coins = coins + ${amount} WHERE id = ${dormId}
    `;

    // 2. Record coin transaction
    await sql`
      INSERT INTO coin_transactions (dormitory_id, type, amount, description)
      VALUES (${dormId}, 'TopUp', ${amount}, 'เติมเงินเข้าระบบ')
    `;

    // 3. Record revenue in platform accounting
    await sql`
      INSERT INTO platform_accounting (dormitory_id, type, category, amount, description, transaction_date)
      VALUES (${dormId}, 'Income', 'TopUp', ${amount}, 'เติมเงินซื้อเหรียญ', CURDATE())
    `;

    return NextResponse.json({ success: true, message: `เติมเงินสำเร็จ ได้รับ ${amount} เหรียญ` });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
