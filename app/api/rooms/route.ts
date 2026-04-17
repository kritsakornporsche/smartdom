import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || '');
    const rooms = await sql`
      SELECT id, room_number, room_type, price, status, floor, image_url, images, amenities, created_at 
      FROM rooms 
      ORDER BY room_number ASC
    `;
    
    return NextResponse.json({ success: true, data: rooms }, { status: 200 });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch rooms', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { room_number, room_type, price, status, floor, image_url, images, amenities } = body;

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
      INSERT INTO rooms (room_number, room_type, price, status, floor, image_url, images, amenities)
      VALUES (${room_number}, ${room_type}, ${price}, ${status || 'Available'}, ${floor || 1}, ${image_url || null}, ${images || '{}'}, ${amenities || '{}'})
      RETURNING *
    `;

    return NextResponse.json({ success: true, message: 'Room created successfully', data: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create room', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
