
import { NextRequest, NextResponse } from 'next/server';
import { getPlatformDb, getDormDb, getDormDbFromSession } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dormIdParam = searchParams.get('dormId');
    
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Determine the dorm_id to query based on session or parameter
    let targetDormId: number | null = null;
    const userRole = (session.user as any)?.role;
    const userDormId = (session.user as any)?.dormId;
    
    if (userRole === 'platform_admin') {
       if (dormIdParam) {
           targetDormId = parseInt(dormIdParam, 10);
       }
    } else {
       targetDormId = userDormId ? parseInt(userDormId, 10) : null;
    }

    if (!targetDormId) {
      return NextResponse.json({ success: false, message: 'Missing dormId context' }, { status: 400 });
    }

    const sql = getDb();
    const rooms = await sql`
      SELECT id, room_number, room_type, price, status, floor, image_url, created_at 
      FROM rooms 
      WHERE dorm_id = ${targetDormId}
      ORDER BY room_number ASC
    `;
    
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
    
    const targetDormId = parseInt((session.user as any).dormId, 10);
    if (!targetDormId) {
       return NextResponse.json({ success: false, message: 'Owner has no dormitory assigned' }, { status: 400 });
    }

    const sql = getDb();

    // Check if room number already exists IN THE SAME DORMITORY
    const existing = await sql`SELECT id FROM rooms WHERE room_number = ${room_number} AND dorm_id = ${targetDormId}`;
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Room number already exists in this dormitory' }, { status: 409 });
    }

    const result = await sql`
      INSERT INTO rooms (room_number, room_type, price, status, floor, image_url, dorm_id)
      VALUES (${room_number}, ${room_type}, ${price}, ${status || 'Available'}, ${floor || 1}, ${image_url || null}, ${targetDormId})
    `;
    
    // In raw MySQL2, insert returns an insertId property
    const newRoomId = (result as any).insertId;

    return NextResponse.json({ 
      success: true, 
      message: 'Room created successfully', 
      data: { id: newRoomId, room_number, room_type, price, status, floor, dorm_id: targetDormId } 
    }, { status: 201 });

  } catch (error: any) {
    console.error('[API Rooms POST Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to create room', error: error.message }, { status: 500 });
  }
}
