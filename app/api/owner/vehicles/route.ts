import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dormId = searchParams.get('dormId');

  if (!dormId) {
    return NextResponse.json({ success: false, message: 'Dormitory ID required' }, { status: 400 });
  }

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const vehicles = await sql`
      SELECT * FROM vehicles 
      WHERE dorm_id = ${parseInt(dormId)}
      ORDER BY room_number ASC
    `;
    
    return NextResponse.json({ success: true, data: vehicles });
  } catch (error: any) {
    console.error('[API Vehicles GET Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch vehicles', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { dorm_id, room_number, owner_name, license_plate, province, vehicle_type, brand_model, color } = body;

    if (!dorm_id || !room_number || !license_plate) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO vehicles (dorm_id, room_number, owner_name, license_plate, province, vehicle_type, brand_model, color)
      VALUES (${dorm_id}, ${room_number}, ${owner_name}, ${license_plate}, ${province}, ${vehicle_type}, ${brand_model}, ${color})
      RETURNING *
    `;

    return NextResponse.json({ success: true, message: 'Vehicle added', data: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('[API Vehicles POST Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to add vehicle', error: error.message }, { status: 500 });
  }
}
