import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const platformSql = getDb();
    const subs = await platformSql`
      SELECT s.*, d.dorm_name, COALESCE(u.name, 'ไม่ระบุ') as owner_name, u.email as owner_email, p.name as package_name, p.price as package_price
      FROM subscriptions s
      JOIN dormitory_registry d ON s.dormitory_id = d.id
      LEFT JOIN users u ON d.owner_id = u.id
      JOIN packages p ON s.package_id = p.id
      ORDER BY s.created_at DESC
    `;
    return NextResponse.json({ success: true, data: subs });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
