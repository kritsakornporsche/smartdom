import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const platformSql = neon('mysql://root:@localhost:3306/smartdom_platform');

export async function GET() {
  try {
    const dorms = await platformSql`
      SELECT d.*, 
             s.status as sub_status, 
             p.name as package_name,
             p.max_rooms
      FROM dormitory_registry d
      LEFT JOIN subscriptions s ON s.dormitory_id = d.id AND s.status = 'Active'
      LEFT JOIN packages p ON s.package_id = p.id
      ORDER BY d.created_at DESC
    `;
    return NextResponse.json({ success: true, data: dorms });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Missing id or status' }, { status: 400 });
    }
    await platformSql`UPDATE dormitory_registry SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: 'อัปเดตสถานะสำเร็จ' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
