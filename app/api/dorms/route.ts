import { NextResponse } from 'next/server';
import { neon } from '@/lib/mysql-adapter';

const MYSQL_BASE = 'mysql://smartdom:smartdom@kritsakorn.thddns.net:5994';
const platformSql = neon(`${MYSQL_BASE}/smartdom_platform`);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petFriendly = searchParams.get('petFriendly') === 'true';
  const hasParking = searchParams.get('hasParking') === 'true';
  const hasAirCon = searchParams.get('hasAirCon') === 'true';
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
  const searchName = searchParams.get('search')?.trim();

  try {
    // 1. Fetch all active registries
    const registries = await platformSql`
      SELECT id, db_name FROM dormitory_registry WHERE status = 'Active'
    `;

    const matchedDorms = [];

    for (const reg of registries) {
      if (!reg.db_name) continue;
      
      try {
        const dormSql = neon(`${MYSQL_BASE}/${reg.db_name}`);
        
        // Fetch profile
        const profileRows = await dormSql`SELECT * FROM dormitory_profile LIMIT 1`;
        if (profileRows.length === 0) continue;
        const profile = profileRows[0];

        // Apply filters on profile
        if (petFriendly && !profile.pet_friendly) continue;
        if (hasParking && !profile.has_parking) continue;
        if (hasAirCon && !profile.has_air_con) continue;
        if (searchName && !profile.name.toLowerCase().includes(searchName.toLowerCase())) continue;

        // Fetch rooms to calculate pricing and availability
        const rooms = await dormSql`SELECT price, status, room_number FROM rooms`;
        
        // Find minimum room price
        const availableRooms = rooms.filter((r: any) => r.status === 'Available' || r.status === 'ว่าง' || r.status === 'available');
        const minPrice = rooms.length > 0 ? Math.min(...rooms.map((r: any) => Number(r.price))) : 0;
        
        // Apply price filter
        if (maxPrice !== null) {
          if (availableRooms.length > 0) {
            // Check if there is an available room within budget
            const hasRoomInBudget = availableRooms.some((r: any) => Number(r.price) <= maxPrice);
            if (!hasRoomInBudget) continue;
          } else {
            // If no available rooms, check if the base room price is in budget
            if (minPrice > maxPrice) continue;
          }
        }

        const availableRoomsCount = availableRooms.length;
        const availableRoomsSummary = availableRooms.map((r: any) => r.room_number).slice(0, 3).join(', ') + (availableRooms.length > 3 ? '...' : '');

        matchedDorms.push({
          id: reg.id,
          name: profile.name,
          address: profile.address,
          phone: profile.phone,
          cover_image: profile.cover_image || null,
          description: profile.description || null,
          pet_friendly: Boolean(profile.pet_friendly),
          has_parking: Boolean(profile.has_parking),
          has_air_con: Boolean(profile.has_air_con),
          has_wifi: Boolean(profile.has_wifi),
          has_lan: Boolean(profile.has_lan),
          min_price: minPrice,
          available_rooms_count: availableRoomsCount,
          available_rooms_summary: availableRoomsCount > 0 ? availableRoomsSummary : null,
        });
      } catch (err) {
        console.error(`Error querying database ${reg.db_name}:`, err);
      }
    }

    return NextResponse.json({ success: true, data: matchedDorms });
  } catch (error: any) {
    console.error('Error fetching dorms:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch dormitories', error: error.message }, { status: 500 });
  }
}
