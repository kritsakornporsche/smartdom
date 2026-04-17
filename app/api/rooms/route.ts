import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Quick migration
    await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES users(id)`;

    const rooms = await sql`
      SELECT r.id, r.room_number, r.room_type, r.price, r.status, r.floor, r.image_url, r.created_at, r.tenant_id, u.name as tenant_name
      FROM rooms r
      LEFT JOIN users u ON r.tenant_id = u.id
      ORDER BY r.room_number ASC
    `;
    
    return NextResponse.json({ success: true, data: rooms }, { status: 200 });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch rooms', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { room_number, room_type, price, status, floor, image_url, tenant_id } = body;

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
      INSERT INTO rooms (room_number, room_type, price, status, floor, image_url, tenant_id)
      VALUES (${room_number}, ${room_type}, ${price}, ${status || 'Available'}, ${floor || 1}, ${image_url || null}, ${tenant_id || null})
      RETURNING *
    `;

    return NextResponse.json({ success: true, message: 'Room created successfully', data: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ success: false, message: 'Failed to create room', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
