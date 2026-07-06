import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function safeJsonParse(val: any) {
  if (typeof val !== 'string') return val || [];
  try {
    return JSON.parse(val);
  } catch {
    try {
      // Fix escaping issues
      const cleaned = val.replace(/\\"/g, '"');
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse features JSON:', val, e);
      return [];
    }
  }
}

export async function GET() {
  try {
    const sql = getDb();
    const packages = await sql`SELECT * FROM packages ORDER BY price ASC`;
    // Parse features JSON string
    const parsed = packages.map((p: any) => ({
      ...p,
      features: safeJsonParse(p.features),
    }));
    return NextResponse.json({ success: true, data: parsed });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, max_rooms, max_dorms, duration_days, features } = await request.json();
    if (!name || price === undefined || !max_rooms) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    const sql = getDb();
    const result = await sql`
      INSERT INTO packages (name, price, max_rooms, max_dorms, duration_days, features)
      VALUES (${name}, ${price}, ${max_rooms}, ${max_dorms || 1}, ${duration_days || 30}, ${JSON.stringify(features || [])})
    `;
    const insertId = (result as any).insertId;
    return NextResponse.json({ success: true, data: { id: insertId, name, price, max_rooms, max_dorms, duration_days, features } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, price, max_rooms, max_dorms, duration_days, features, is_active } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });
    const sql = getDb();
    await sql`
      UPDATE packages SET
        name = ${name}, price = ${price}, max_rooms = ${max_rooms}, max_dorms = ${max_dorms || 1},
        duration_days = ${duration_days || 30}, features = ${JSON.stringify(features || [])},
        is_active = ${is_active ? 1 : 0}
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true, message: 'อัปเดตแพ็กเกจสำเร็จ' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });

    const sql = getDb();
    // Check if the package is in use by any subscription to prevent foreign key errors and data loss
    const subscriptions = await sql`SELECT id FROM subscriptions WHERE package_id = ${id} LIMIT 1`;
    if (subscriptions.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่สามารถลบแพ็กเกจได้ เนื่องจากมีประวัติผู้ใช้งานหรือผู้ใช้งานกำลังใช้งานแพ็กเกจนี้อยู่ แนะนำให้ปิดการใช้งานแทน' 
      }, { status: 400 });
    }

    await sql`DELETE FROM packages WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: 'ลบแพ็กเกจสำเร็จ' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
