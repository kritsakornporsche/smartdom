import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const MYSQL_BASE = 'mysql://root:@localhost:3306';
const platformSql = neon(`${MYSQL_BASE}/smartdom_platform`);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  if (!dormId) return NextResponse.json({ success: false, message: 'Missing dormId' }, { status: 400 });

  try {
    const reg = await platformSql`SELECT coins FROM dormitory_registry WHERE id = ${dormId} LIMIT 1`;
    const transactions = await platformSql`
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

    // 1. Add coins to dormitory
    await platformSql`
      UPDATE dormitory_registry SET coins = coins + ${amount} WHERE id = ${dormId}
    `;

    // 2. Record coin transaction
    await platformSql`
      INSERT INTO coin_transactions (dormitory_id, type, amount, description)
      VALUES (${dormId}, 'TopUp', ${amount}, 'เติมเงินเข้าระบบ')
    `;

    // 3. Record revenue in platform accounting
    await platformSql`
      INSERT INTO platform_accounting (dormitory_id, type, category, amount, description, transaction_date)
      VALUES (${dormId}, 'Income', 'TopUp', ${amount}, 'เติมเงินซื้อเหรียญ', CURDATE())
    `;

    return NextResponse.json({ success: true, message: `เติมเงินสำเร็จ ได้รับ ${amount} เหรียญ` });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
