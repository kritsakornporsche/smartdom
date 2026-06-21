import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const platformSql = neon('mysql://root:@localhost:3306/smartdom_platform');

export async function GET() {
  try {
    const packages = await platformSql`SELECT * FROM packages ORDER BY price ASC`;
    // Parse features JSON string
    const parsed = packages.map(p => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || []),
    }));
    return NextResponse.json({ success: true, data: parsed });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, max_rooms, duration_days, features } = await request.json();
    if (!name || price === undefined || !max_rooms) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    const result = await platformSql`
      INSERT INTO packages (name, price, max_rooms, duration_days, features)
      VALUES (${name}, ${price}, ${max_rooms}, ${duration_days || 30}, ${JSON.stringify(features || [])})
      RETURNING id
    `;
    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, price, max_rooms, duration_days, features, is_active } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });
    await platformSql`
      UPDATE packages SET
        name = ${name}, price = ${price}, max_rooms = ${max_rooms},
        duration_days = ${duration_days || 30}, features = ${JSON.stringify(features || [])},
        is_active = ${is_active ? 1 : 0}
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true, message: 'อัปเดตแพ็กเกจสำเร็จ' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
