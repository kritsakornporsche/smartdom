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

    // 1. Fetch all dorm profiles joined with registry
    const dorms = await sql`
      SELECT 
        r.id as dorm_id, r.dorm_name as name, r.address, r.phone,
        p.cover_image, p.description, p.pet_friendly, p.has_parking, p.has_air_con, p.has_wifi, p.has_lan
      FROM dormitory_registry r
      LEFT JOIN dormitory_profile p ON r.id = p.dorm_id
      WHERE r.status = 'Active'
    `;

    const matchedDorms = [];

    for (const dorm of dorms) {
      try {
        // Apply filters on profile
        if (petFriendly && !dorm.pet_friendly) continue;
        if (hasParking && !dorm.has_parking) continue;
        if (hasAirCon && !dorm.has_air_con) continue;
        if (searchName && !dorm.name?.toLowerCase().includes(searchName.toLowerCase())) continue;

        // Fetch rooms for this dorm
        const rooms = await sql`
          SELECT price, status, room_number FROM rooms WHERE dorm_id = ${dorm.dorm_id}
        `;
        
        // Find minimum room price
        const availableRooms = rooms.filter((r: any) => r.status === 'Available' || r.status === 'ว่าง' || r.status === 'available');
        const minPrice = rooms.length > 0 ? Math.min(...rooms.map((r: any) => Number(r.price))) : 0;
        
        // Apply price filter
        if (maxPrice !== null) {
          if (availableRooms.length > 0) {
            const hasRoomInBudget = availableRooms.some((r: any) => Number(r.price) <= maxPrice);
            if (!hasRoomInBudget) continue;
          } else {
            if (minPrice > maxPrice) continue;
          }
        }

        const availableRoomsCount = availableRooms.length;
        const availableRoomsSummary = availableRooms.map((r: any) => r.room_number).slice(0, 3).join(', ') + (availableRooms.length > 3 ? '...' : '');

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
          min_price: minPrice,
          available_rooms_count: availableRoomsCount,
          available_rooms_summary: availableRoomsCount > 0 ? availableRoomsSummary : null,
        });
      } catch (err) {
        console.error(`Error processing dorm profile ${dorm.dorm_id}:`, err);
      }
    }

    return NextResponse.json({ success: true, data: matchedDorms });
  } catch (error: any) {
    console.error('Error fetching dorms:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch dormitories', error: error.message }, { status: 500 });
  }
}
