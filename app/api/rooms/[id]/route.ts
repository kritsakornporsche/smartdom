import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { room_number, room_type, price, status, floor, image_url, images, amenities } = body;

    if (!id || !room_number || !room_type || price === undefined) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Check if room number already exists for a DIFFERENT room
    const existing = await sql`SELECT id FROM rooms WHERE room_number = ${room_number} AND id != ${id}`;
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Room number already exists' }, { status: 409 });
    }

    const result = await sql`
      UPDATE rooms 
      SET room_number = ${room_number}, 
          room_type = ${room_type}, 
          price = ${price}, 
          status = ${status}, 
          floor = ${floor}, 
          image_url = ${image_url || null},
          images = ${images || '{}'},
          amenities = ${amenities || '{}'}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Room updated successfully', data: result[0] }, { status: 200 });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update room', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Room ID is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    const result = await sql`
      DELETE FROM rooms
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Room deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete room', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
