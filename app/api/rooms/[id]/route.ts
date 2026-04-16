import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Fetch room with dorm, owner and keeper info
    const result = await sql`
      SELECT 
        r.*, 
        d.name as dorm_name, d.address as dorm_address, d.phone as dorm_phone,
        u.name as owner_name,
        k.name as keeper_name, k.phone as keeper_phone, k.email as keeper_email
      FROM rooms r
      JOIN dormitory_profile d ON r.dorm_id = d.id
      JOIN users u ON d.owner_id = u.id
      LEFT JOIN keepers k ON d.id = k.dorm_id
      WHERE r.id = ${id}
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: result[0] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch room', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { room_number, room_type, price, status, floor, image_url } = body;

    if (!id || !room_number || !room_type || price === undefined) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Get the dorm_id of the room being updated
    const roomInfo = await sql`SELECT dorm_id FROM rooms WHERE id = ${id}`;
    if (roomInfo.length === 0) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }
    const dorm_id = roomInfo[0].dorm_id;

    // Check if room number already exists for a DIFFERENT room IN THE SAME DORMITORY
    const existing = await sql`SELECT id FROM rooms WHERE room_number = ${room_number} AND dorm_id = ${dorm_id} AND id != ${id}`;
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Room number already exists in this dormitory' }, { status: 409 });
    }

    const result = await sql`
      UPDATE rooms 
      SET room_number = ${room_number}, 
          room_type = ${room_type}, 
          price = ${price}, 
          status = ${status}, 
          floor = ${floor}, 
          image_url = ${image_url || null}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Room updated successfully', data: result[0] }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating room:', error);
    return NextResponse.json({ success: false, message: 'Failed to update room', error: error.message }, { status: 500 });
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
  } catch (error: any) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete room', error: error.message }, { status: 500 });
  }
}
