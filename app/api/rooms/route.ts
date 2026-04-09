import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  try {
    const sql = neon(process.env.DATABASE_URL || '');
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
    
    return NextResponse.json({ success: true, data: rooms }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch rooms', error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { room_number, room_type, price, status, floor, image_url, dorm_id } = body;


    // Validate inputs
    if (!room_number || !room_type || price === undefined) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Check if room number already exists
    const existing = await sql`SELECT id FROM rooms WHERE room_number = ${room_number}`;
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Room number already exists' }, { status: 409 });
    }

    const result = await sql`
      INSERT INTO rooms (room_number, room_type, price, status, floor, image_url, dorm_id)
      VALUES (${room_number}, ${room_type}, ${price}, ${status || 'Available'}, ${floor || 1}, ${image_url || null}, ${dorm_id || null})
      RETURNING *
    `;


    return NextResponse.json({ success: true, message: 'Room created successfully', data: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating room:', error);
    return NextResponse.json({ success: false, message: 'Failed to create room', error: error.message }, { status: 500 });
  }
}
