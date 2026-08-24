import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/auth';

// Fetch all meter readings or filter by room
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sql = getDb();

    let dormId = parseInt(searchParams.get('dormId') || (session.user as any)?.dormId || '0', 10);
    if (!dormId || dormId === 0) {
      const dormRes = await sql`
        SELECT d.id FROM dormitory_registry d
        JOIN users u ON d.owner_id = u.id
        WHERE u.email = ${session.user.email}
        LIMIT 1
      `;
      dormId = dormRes.length > 0 ? dormRes[0].id : 1;
    }

    const billingCycle = searchParams.get('billing_cycle');
    
    let readings;
    if (billingCycle && billingCycle !== 'all') {
      readings = await sql`
        SELECT m.*, r.room_number 
        FROM meter_readings m
        JOIN rooms r ON m.room_id = r.id
        WHERE m.dorm_id = ${dormId} AND m.billing_cycle = ${billingCycle}
        ORDER BY r.room_number ASC, m.type ASC
      `;
    } else {
      readings = await sql`
        SELECT m.*, r.room_number 
        FROM meter_readings m
        JOIN rooms r ON m.room_id = r.id
        WHERE m.dorm_id = ${dormId}
        ORDER BY m.billing_cycle DESC, r.room_number ASC, m.type ASC
        LIMIT 200
      `;
    }

    return NextResponse.json({ success: true, data: readings, dormId });
  } catch (error: any) {
    console.error('[API Meters GET Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Create new meter reading or batch create
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const sql = getDb();

    let dormId = parseInt(body.dorm_id || (session.user as any)?.dormId || '0', 10);
    if (!dormId || dormId === 0) {
      const dormRes = await sql`
        SELECT d.id FROM dormitory_registry d
        JOIN users u ON d.owner_id = u.id
        WHERE u.email = ${session.user.email}
        LIMIT 1
      `;
      dormId = dormRes.length > 0 ? dormRes[0].id : 1;
    }

    // Batch insertion support
    if (Array.isArray(body.items)) {
      const items = body.items;
      let insertedCount = 0;
      for (const item of items) {
        const { room_id, type, previous_reading, current_reading, billing_cycle } = item;
        if (!room_id || !type || current_reading === undefined || !billing_cycle) continue;

        // Upsert
        const existing = await sql`
          SELECT id FROM meter_readings 
          WHERE dorm_id = ${dormId} AND room_id = ${room_id} AND type = ${type} AND billing_cycle = ${billing_cycle}
        `;

        if (existing.length > 0) {
          await sql`
            UPDATE meter_readings
            SET previous_reading = ${previous_reading || 0}, current_reading = ${current_reading}
            WHERE id = ${existing[0].id}
          `;
        } else {
          await sql`
            INSERT INTO meter_readings (dorm_id, room_id, type, previous_reading, current_reading, billing_cycle)
            VALUES (${dormId}, ${room_id}, ${type}, ${previous_reading || 0}, ${current_reading}, ${billing_cycle})
          `;
        }
        insertedCount++;
      }
      return NextResponse.json({ success: true, message: `บันทึกมิเตอร์สำเร็จ ${insertedCount} รายการ`, count: insertedCount });
    }

    // Single insertion
    const { room_id, type, previous_reading, current_reading, billing_cycle } = body;

    if (!room_id || !type || current_reading === undefined || !billing_cycle) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    
    // Check for existing record
    const existing = await sql`
      SELECT id FROM meter_readings 
      WHERE dorm_id = ${dormId} AND room_id = ${room_id} AND type = ${type} AND billing_cycle = ${billing_cycle}
    `;

    if (existing.length > 0) {
      await sql`
        UPDATE meter_readings
        SET previous_reading = ${previous_reading || 0}, current_reading = ${current_reading}
        WHERE id = ${existing[0].id}
      `;
      return NextResponse.json({ success: true, message: 'อัปเดตการจดมิเตอร์เรียบร้อยแล้ว' });
    }

    const result = await sql`
      INSERT INTO meter_readings (dorm_id, room_id, type, previous_reading, current_reading, billing_cycle)
      VALUES (${dormId}, ${room_id}, ${type}, ${previous_reading || 0}, ${current_reading}, ${billing_cycle})
    `;

    return NextResponse.json({ success: true, message: 'บันทึกมิเตอร์เรียบร้อยแล้ว', data: { id: (result as any).insertId } }, { status: 201 });
  } catch (error: any) {
    console.error('[API Meters POST Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
