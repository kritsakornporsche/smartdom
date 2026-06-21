import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const platformSql = neon('mysql://root:@localhost:3306/smartdom_platform');

export async function GET() {
  try {
    const subs = await platformSql`
      SELECT s.*, d.dorm_name, d.owner_name, d.owner_email, p.name as package_name, p.price as package_price
      FROM subscriptions s
      JOIN dormitory_registry d ON s.dormitory_id = d.id
      JOIN packages p ON s.package_id = p.id
      ORDER BY s.created_at DESC
    `;
    return NextResponse.json({ success: true, data: subs });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
