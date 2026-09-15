import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET /api/owner/settings?email=...&dormDbName=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const dormDbName = searchParams.get('dormDbName');

  if (!email) {
    return NextResponse.json({ success: false, message: 'Missing email parameter' }, { status: 400 });
  }

  try {
    const sql = getDb();

    // Security: Verify owner email owns the dormitory
    const reg = await sql`
      SELECT id, dorm_name, db_name, phone, address, owner_id 
      FROM dormitory_registry 
      WHERE owner_email = ${email} AND status = 'Active'
    `;
    if (reg.length === 0) {
      return NextResponse.json({ success: false, message: 'Unauthorized or no active dormitory' }, { status: 403 });
    }

    // Determine target dorm
    let targetDorm = reg[0];
    if (dormDbName) {
      const matched = reg.find((r: any) => r.db_name === dormDbName || r.id.toString() === dormDbName.toString());
      if (matched) targetDorm = matched;
    }

    const dormId = targetDorm.id;
    const profile = await sql`SELECT * FROM dormitory_profile WHERE dorm_id = ${dormId} LIMIT 1`;

    if (profile.length > 0) {
      return NextResponse.json({
        success: true,
        data: profile[0]
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        dorm_id: dormId,
        name: targetDorm.dorm_name,
        phone: targetDorm.phone,
        address: targetDorm.address,
        water_rate: 18,
        electricity_rate: 8,
        promptpay_number: '',
        promptpay_name: ''
      }
    });
  } catch (err: any) {
    console.error('Error fetching settings:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST /api/owner/settings
export async function POST(req: Request) {
  try {
    const {
      email,
      dormDbName,
      name,
      address,
      phone,
      tax_id,
      water_rate,
      electricity_rate,
      has_wifi,
      has_parking,
      pet_friendly,
      has_lan,
      facilities,
      map_url,
      description,
      has_air_con,
      cover_image,
      promptpay_number,
      promptpay_name
    } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
    }

    const sql = getDb();

    // Security: Verify owner email owns the dormitory
    const reg = await sql`
      SELECT id, owner_id, db_name 
      FROM dormitory_registry 
      WHERE owner_email = ${email} AND status = 'Active'
    `;
    if (reg.length === 0) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    let targetDorm = reg[0];
    if (dormDbName) {
      const matched = reg.find((r: any) => r.db_name === dormDbName || r.id.toString() === dormDbName.toString());
      if (matched) targetDorm = matched;
    }
    const dormId = targetDorm.id;
    const ownerId = targetDorm.owner_id;

    // Update in platform registry too, to keep it sync'd (dorm_name, phone, address)
    await sql`
      UPDATE dormitory_registry 
      SET dorm_name = ${name}, phone = ${phone || ''}, address = ${address || ''}
      WHERE id = ${dormId}
    `;

    // Check if profile exists
    const existing = await sql`SELECT id FROM dormitory_profile WHERE dorm_id = ${dormId} LIMIT 1`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO dormitory_profile (
          dorm_id, owner_id, name, address, phone, tax_id, water_rate, electricity_rate,
          has_wifi, has_parking, pet_friendly, has_lan, facilities, map_url,
          description, has_air_con, cover_image, promptpay_number, promptpay_name
        ) VALUES (
          ${dormId}, ${ownerId}, ${name}, ${address || ''}, ${phone || ''}, ${tax_id || ''}, 
          ${water_rate || 18.00}, ${electricity_rate || 8.00},
          ${has_wifi ? 1 : 0}, ${has_parking ? 1 : 0}, ${pet_friendly ? 1 : 0}, ${has_lan ? 1 : 0}, 
          ${facilities || ''}, ${map_url || ''}, ${description || ''}, 
          ${has_air_con ? 1 : 0}, ${cover_image || ''},
          ${promptpay_number || ''}, ${promptpay_name || ''}
        )
      `;
    } else {
      await sql`
        UPDATE dormitory_profile
        SET 
          name = ${name},
          address = ${address || ''},
          phone = ${phone || ''},
          tax_id = ${tax_id || ''},
          water_rate = ${water_rate || 18.00},
          electricity_rate = ${electricity_rate || 8.00},
          has_wifi = ${has_wifi ? 1 : 0},
          has_parking = ${has_parking ? 1 : 0},
          pet_friendly = ${pet_friendly ? 1 : 0},
          has_lan = ${has_lan ? 1 : 0},
          facilities = ${facilities || ''},
          map_url = ${map_url || ''},
          description = ${description || ''},
          has_air_con = ${has_air_con ? 1 : 0},
          cover_image = ${cover_image || ''},
          promptpay_number = ${promptpay_number || ''},
          promptpay_name = ${promptpay_name || ''}
        WHERE dorm_id = ${dormId}
      `;
    }

    return NextResponse.json({ success: true, message: 'บันทึกข้อมูลสำเร็จ' });
  } catch (err: any) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
