import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  try {
    let rooms;
    if (dormId) {
      rooms = await sql`
        SELECT id, room_number, room_type, price, status, floor, image_url, created_at 
        FROM rooms 
        WHERE dorm_id = ${parseInt(dormId)}
        ORDER BY room_number ASC
      `;
    } else {
      rooms = await sql`
        SELECT id, room_number, room_type, price, status, floor, image_url, created_at 
        FROM rooms 
        ORDER BY room_number ASC
      `;
    }
    
    return NextResponse.json({ success: true, data: rooms });

  } catch (error: any) {
    console.error('[API Rooms GET Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized: Only owners can create rooms' }, { status: 401 });
    }

    const body = await req.json();
    const { room_number, room_type, price, status, floor, image_url, dorm_id } = body;

    if (!room_number || !room_type || price === undefined) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if room number already exists IN THE SAME DORMITORY
    const existing = await sql`SELECT id FROM rooms WHERE room_number = ${room_number} AND dorm_id = ${dorm_id}`;
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Room number already exists in this dormitory' }, { status: 409 });
    }

    const result = await sql`
      INSERT INTO rooms (room_number, room_type, price, status, floor, image_url, dorm_id)
      VALUES (${room_number}, ${room_type}, ${price}, ${status || 'Available'}, ${floor || 1}, ${image_url || null}, ${dorm_id || null})
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Room created successfully', 
      data: result[0] 
    }, { status: 201 });

  } catch (error: any) {
    console.error('[API Rooms POST Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to create room', error: error.message }, { status: 500 });
  }
}
