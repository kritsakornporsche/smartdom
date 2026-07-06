import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/auth';

// Fetch all meter readings or filter by room
export async function GET(req: Request) {
  try {
    const session = await auth();
    const dormId = parseInt((session?.user as any)?.dormId, 10);
    if (!session || (session.user as any).role !== 'owner' || !dormId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const billingCycle = searchParams.get('billing_cycle');
    
    const sql = getDb();
    let readings;
    if (billingCycle) {
       readings = await sql`
         SELECT m.*, r.room_number 
         FROM meter_readings m
         JOIN rooms r ON m.room_id = r.id
         WHERE m.dorm_id = ${dormId} AND m.billing_cycle = ${billingCycle}
         ORDER BY r.room_number ASC
       `;
    } else {
       readings = await sql`
         SELECT m.*, r.room_number 
         FROM meter_readings m
         JOIN rooms r ON m.room_id = r.id
         WHERE m.dorm_id = ${dormId}
         ORDER BY m.created_at DESC LIMIT 100
       `;
    }

    return NextResponse.json({ success: true, data: readings });
  } catch (error: any) {
    console.error('[API Meters GET Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Create new meter reading
export async function POST(req: Request) {
  try {
    const session = await auth();
    const dormId = parseInt((session?.user as any)?.dormId, 10);
    if (!session || (session.user as any).role !== 'owner' || !dormId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { room_id, type, previous_reading, current_reading, billing_cycle } = body;

    if (!room_id || !type || current_reading === undefined || !billing_cycle) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const sql = getDb();
    
    // Check for existing record
    const existing = await sql`
      SELECT id FROM meter_readings 
      WHERE dorm_id = ${dormId} AND room_id = ${room_id} AND type = ${type} AND billing_cycle = ${billing_cycle}
    `;

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Meter reading for this cycle already exists' }, { status: 409 });
    }

    const result = await sql`
      INSERT INTO meter_readings (dorm_id, room_id, type, previous_reading, current_reading, billing_cycle)
      VALUES (${dormId}, ${room_id}, ${type}, ${previous_reading || 0}, ${current_reading}, ${billing_cycle})
    `;

    return NextResponse.json({ success: true, message: 'Meter reading saved successfully', data: { id: (result as any).insertId } }, { status: 201 });
  } catch (error: any) {
    console.error('[API Meters POST Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
