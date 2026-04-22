import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || '');
    const dorms = await sql`
      SELECT d.id, d.name, d.address, d.phone, 
             d.water_rate, d.electricity_rate, d.pet_friendly, d.has_wifi, d.has_parking, d.facilities, d.map_url,
             (SELECT COUNT(*)::int FROM rooms r WHERE r.dorm_id = d.id AND (r.status = 'Available' OR r.status = 'ว่าง')) as available_rooms_count,
             (SELECT STRING_AGG(room_number, ', ') FROM rooms r WHERE r.dorm_id = d.id AND (r.status = 'Available' OR r.status = 'ว่าง')) as available_rooms_summary
      FROM dormitory_profile d
      ORDER BY available_rooms_count DESC
    `;
    
    return NextResponse.json({ success: true, data: dorms }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch dormitories', error: error.message }, { status: 500 });
  }
}
