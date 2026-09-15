import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const dormId = resolvedParams.id;

    const sql = getDb();

    const dorms = await sql`
      SELECT 
        r.id as dorm_id, r.dorm_name as name, r.address, COALESCE(p.phone, r.phone) as phone,
        u.name as owner_name, u.email as owner_email,
        p.cover_image, p.description, p.pet_friendly, p.has_parking, p.has_air_con, p.has_wifi, p.has_lan,
        p.water_rate, p.electricity_rate, p.facilities, p.map_url,
        COALESCE(MIN(rm.price), 0) as min_price,
        COUNT(CASE WHEN rm.status IN ('Available', 'ว่าง', 'available') THEN 1 END) as available_rooms_count
      FROM dormitory_registry r
      JOIN users u ON r.owner_id = u.id
      LEFT JOIN dormitory_profile p ON r.id = p.dorm_id
      LEFT JOIN rooms rm ON r.id = rm.dorm_id
      WHERE r.id = ${dormId} AND r.status = 'Active'
      GROUP BY r.id, r.dorm_name, r.address, r.phone, p.phone, u.name, u.email, p.cover_image, p.description, p.pet_friendly, p.has_parking, p.has_air_con, p.has_wifi, p.has_lan, p.water_rate, p.electricity_rate, p.facilities, p.map_url
      LIMIT 1
    `;

    if (dorms.length === 0) {
      return NextResponse.json({ success: false, message: 'Dormitory not found' }, { status: 404 });
    }

    const dorm = dorms[0];

    return NextResponse.json({
      success: true,
      data: {
        id: dorm.dorm_id,
        name: dorm.name,
        address: dorm.address,
        phone: dorm.phone,
        owner_name: dorm.owner_name,
        owner_email: dorm.owner_email,
        cover_image: dorm.cover_image || null,
        description: dorm.description || null,
        pet_friendly: Boolean(dorm.pet_friendly),
        has_parking: Boolean(dorm.has_parking),
        has_air_con: Boolean(dorm.has_air_con),
        has_wifi: Boolean(dorm.has_wifi),
        has_lan: Boolean(dorm.has_lan),
        water_rate: Number(dorm.water_rate) || 18,
        electricity_rate: Number(dorm.electricity_rate) || 8,
        facilities: dorm.facilities || '',
        map_url: dorm.map_url || '',
        min_price: Number(dorm.min_price),
        available_rooms_count: Number(dorm.available_rooms_count),
      }
    });
  } catch (error: any) {
    console.error('Error fetching dorm by id:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch dormitory', error: error.message }, { status: 500 });
  }
}
