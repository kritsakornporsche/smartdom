import { NextResponse } from 'next/server';
import { neon } from '@/lib/mysql-adapter';

const MYSQL_BASE = 'mysql://smartdom:smartdom@kritsakorn.thddns.net:5994';
const platformSql = neon(`${MYSQL_BASE}/smartdom_platform`);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, message: 'Missing subscription ID' }, { status: 400 });

    // Find the subscription
    const subs = await platformSql`SELECT * FROM subscriptions WHERE id = ${id} AND status = 'Active' LIMIT 1`;
    if (subs.length === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลการสมัคร หรือแพ็กเกจไม่ได้ถูกใช้งานอยู่' }, { status: 400 });
    }
    const sub = subs[0];

    // Update status to Cancelled
    await platformSql`UPDATE subscriptions SET status = 'Cancelled' WHERE id = ${id}`;

    // Refund coins if amount_paid > 0
    if (sub.amount_paid > 0) {
      await platformSql`UPDATE dormitory_registry SET coins = coins + ${sub.amount_paid} WHERE id = ${sub.dormitory_id}`;
      await platformSql`
        INSERT INTO coin_transactions (dormitory_id, type, amount, description)
        VALUES (${sub.dormitory_id}, 'Refund', ${sub.amount_paid}, 'คืนเหรียญจากการยกเลิกแพ็กเกจโดยระบบ (Platform Admin)')
      `;
    }

    return NextResponse.json({ success: true, message: 'ยกเลิกแพ็กเกจและคืนเหรียญเรียบร้อยแล้ว' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
