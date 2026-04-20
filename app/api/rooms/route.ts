import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  try {
    // Quick migration to ensure tenant_id exists
    await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES users(id)`;
    await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS dorm_id INTEGER REFERENCES dormitories(id)`;

    let rooms;
    if (dormId) {
      rooms = await sql`
        SELECT r.id, r.room_number, r.room_type, r.price, r.status, r.floor, r.image_url, r.created_at, r.tenant_id, u.full_name as tenant_name
        FROM rooms r
        LEFT JOIN users u ON r.tenant_id = u.id
        WHERE r.dorm_id = ${parseInt(dormId)}
        ORDER BY r.room_number ASC
      `;
    } else {
      rooms = await sql`
        SELECT r.id, r.room_number, r.room_type, r.price, r.status, r.floor, r.image_url, r.created_at, r.tenant_id, u.full_name as tenant_name
        FROM rooms r
        LEFT JOIN users u ON r.tenant_id = u.id
        ORDER BY r.room_number ASC
      `;
    }
    
    return NextResponse.json({ success: true, data: rooms });

  } catch (error: any) {
    console.error('[API Rooms GET Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch rooms', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized: Only owners can create rooms' }, { status: 401 });
    }

    const body = await req.json();
    const { room_number, room_type, price, status, floor, image_url, dorm_id, tenant_id } = body;

    if (!room_number || !room_type || price === undefined) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if room number already exists IN THE SAME DORMITORY
    if (dorm_id) {
        const existing = await sql`SELECT id FROM rooms WHERE room_number = ${room_number} AND dorm_id = ${dorm_id}`;
        if (existing.length > 0) {
            return NextResponse.json({ success: false, message: 'Room number already exists in this dormitory' }, { status: 409 });
        }
    }

    const result = await sql`
      INSERT INTO rooms (room_number, room_type, price, status, floor, image_url, dorm_id, tenant_id)
      VALUES (${room_number}, ${room_type}, ${price}, ${status || 'Available'}, ${floor || 1}, ${image_url || null}, ${dorm_id || null}, ${tenant_id || null})
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
