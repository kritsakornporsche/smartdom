import { NextResponse } from 'next/server';
import { neon } from '@/lib/mysql-adapter';

const MYSQL_BASE = 'mysql://smartdom:smartdom@kritsakorn.thddns.net:5994';
const platformSql = neon(`${MYSQL_BASE}/smartdom_platform`);

// GET /api/owner/settings?email=...&dormDbName=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const dormDbName = searchParams.get('dormDbName');

  if (!email || !dormDbName) {
    return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
  }

  try {
    // Security: Verify owner email owns the database
    const reg = await platformSql`
      SELECT id FROM dormitory_registry 
      WHERE owner_email = ${email} AND db_name = ${dormDbName} AND status = 'Active'
      LIMIT 1
    `;
    if (reg.length === 0) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const dormSql = neon(`${MYSQL_BASE}/${dormDbName}`);
    const profile = await dormSql`SELECT * FROM dormitory_profile LIMIT 1`;

    return NextResponse.json({
      success: true,
      data: profile[0] || null
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
      cover_image
    } = await req.json();

    if (!email || !dormDbName || !name) {
      return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
    }

    // Security: Verify owner email owns the database
    const reg = await platformSql`
      SELECT id FROM dormitory_registry 
      WHERE owner_email = ${email} AND db_name = ${dormDbName} AND status = 'Active'
      LIMIT 1
    `;
    if (reg.length === 0) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    // Update in platform registry too, to keep it sync'd (dorm_name, phone, address)
    await platformSql`
      UPDATE dormitory_registry 
      SET dorm_name = ${name}, phone = ${phone || ''}, address = ${address || ''}
      WHERE db_name = ${dormDbName}
    `;

    const dormSql = neon(`${MYSQL_BASE}/${dormDbName}`);
    
    // Check if profile exists
    const existing = await dormSql`SELECT id FROM dormitory_profile LIMIT 1`;
    if (existing.length === 0) {
      await dormSql`
        INSERT INTO dormitory_profile (
          name, address, phone, tax_id, water_rate, electricity_rate,
          has_wifi, has_parking, pet_friendly, has_lan, facilities, map_url,
          description, has_air_con, cover_image
        ) VALUES (
          ${name}, ${address || ''}, ${phone || ''}, ${tax_id || ''}, 
          ${water_rate || 18.00}, ${electricity_rate || 8.00},
          ${has_wifi ? 1 : 0}, ${has_parking ? 1 : 0}, ${pet_friendly ? 1 : 0}, ${has_lan ? 1 : 0}, 
          ${facilities || ''}, ${map_url || ''}, ${description || ''}, 
          ${has_air_con ? 1 : 0}, ${cover_image || ''}
        )
      `;
    } else {
      await dormSql`
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
          cover_image = ${cover_image || ''}
        WHERE id = ${existing[0].id}
      `;
    }

    return NextResponse.json({ success: true, message: 'บันทึกข้อมูลสำเร็จ' });
  } catch (err: any) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
