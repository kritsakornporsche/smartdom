import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petFriendly = searchParams.get('petFriendly') === 'true';
  const hasParking = searchParams.get('hasParking') === 'true';
  const hasAirCon = searchParams.get('hasAirCon') === 'true';
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
  const searchName = searchParams.get('search')?.trim();

  try {
    const sql = getDb();

    // 1. Fetch all dorm profiles joined with registry and room aggregation in ONE query
    const dorms = await sql`
      SELECT 
        r.id as dorm_id, r.dorm_name as name, r.address, r.phone,
        p.cover_image, p.description, p.pet_friendly, p.has_parking, p.has_air_con, p.has_wifi, p.has_lan,
        COALESCE(MIN(rm.price), 0) as min_price,
        COUNT(CASE WHEN rm.status IN ('Available', 'ว่าง', 'available') THEN 1 END) as available_rooms_count
      FROM dormitory_registry r
      LEFT JOIN dormitory_profile p ON r.id = p.dorm_id
      LEFT JOIN rooms rm ON r.id = rm.dorm_id
      WHERE r.status = 'Active'
      GROUP BY r.id, r.dorm_name, r.address, r.phone, p.cover_image, p.description, p.pet_friendly, p.has_parking, p.has_air_con, p.has_wifi, p.has_lan
    `;

    const matchedDorms = [];

    for (const dorm of dorms) {
      // Apply filters on profile
      if (petFriendly && !dorm.pet_friendly) continue;
      if (hasParking && !dorm.has_parking) continue;
      if (hasAirCon && !dorm.has_air_con) continue;
      if (searchName && !dorm.name?.toLowerCase().includes(searchName.toLowerCase())) continue;
      if (maxPrice !== null && Number(dorm.min_price) > maxPrice) continue;

      matchedDorms.push({
        id: dorm.dorm_id,
        name: dorm.name,
        address: dorm.address,
        phone: dorm.phone,
        cover_image: dorm.cover_image || null,
        description: dorm.description || null,
        pet_friendly: Boolean(dorm.pet_friendly),
        has_parking: Boolean(dorm.has_parking),
        has_air_con: Boolean(dorm.has_air_con),
        has_wifi: Boolean(dorm.has_wifi),
        has_lan: Boolean(dorm.has_lan),
        min_price: Number(dorm.min_price),
        available_rooms_count: Number(dorm.available_rooms_count),
        available_rooms_summary: Number(dorm.available_rooms_count) > 0 ? `${dorm.available_rooms_count} ห้องว่าง` : null,
      });
    }

    return NextResponse.json({ success: true, data: matchedDorms });
  } catch (error: any) {
    console.error('Error fetching dorms:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch dormitories', error: error.message }, { status: 500 });
  }
}
