import { NextResponse } from 'next/server';
import { neon } from '@/lib/mysql-adapter';

const MYSQL_BASE = 'mysql://smartdom:smartdom@kritsakorn.thddns.net:5994';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dormDbName = searchParams.get('dormDbName');

  if (!dormDbName) {
    return NextResponse.json({ success: false, message: 'dormDbName required' }, { status: 400 });
  }

  try {
    const sql = neon(`${MYSQL_BASE}/${dormDbName}`);
    
    const transactions = await sql`
      SELECT * FROM accounting_transactions
      ORDER BY transaction_date DESC, created_at DESC
      LIMIT 100
    `;

    // Monthly summary
    const monthlySummary = await sql`
      SELECT 
        YEAR(transaction_date) as year,
        MONTH(transaction_date) as month,
        SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as expense
      FROM accounting_transactions
      GROUP BY YEAR(transaction_date), MONTH(transaction_date)
      ORDER BY year DESC, month DESC
      LIMIT 12
    `;

    const totalIncome = transactions
      .filter((t: any) => t.type === 'Income')
      .reduce((s: number, t: any) => s + Number(t.amount), 0);
    const totalExpense = transactions
      .filter((t: any) => t.type === 'Expense')
      .reduce((s: number, t: any) => s + Number(t.amount), 0);

    return NextResponse.json({
      success: true,
      transactions,
      monthlySummary,
      totals: { income: totalIncome, expense: totalExpense, profit: totalIncome - totalExpense },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { dormDbName, type, category, amount, description, transaction_date } = await req.json();
    if (!dormDbName || !type || !category || !amount || !transaction_date) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const sql = neon(`${MYSQL_BASE}/${dormDbName}`);
    const result = await sql`
      INSERT INTO accounting_transactions (type, category, amount, description, transaction_date)
      VALUES (${type}, ${category}, ${amount}, ${description || ''}, ${transaction_date})
      RETURNING id
    `;
    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
