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

    const parcels = await sql`
      SELECT * FROM parcels 
      WHERE dorm_id = ${parseInt(dormId)}
      ORDER BY received_date DESC
    `;
    
    return NextResponse.json({ success: true, data: parcels });
  } catch (error: any) {
    console.error('[API Parcels GET Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch parcels', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { dorm_id, room_number, recipient_name, tracking_number, carrier, status, image_url } = body;

    if (!dorm_id || !room_number || !recipient_name) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO parcels (dorm_id, room_number, recipient_name, tracking_number, carrier, status, image_url)
      VALUES (${dorm_id}, ${room_number}, ${recipient_name}, ${tracking_number || null}, ${carrier || null}, ${status || 'Received'}, ${image_url || null})
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Parcel recorded successfully', 
      data: result[0] 
    }, { status: 201 });

  } catch (error: any) {
    console.error('[API Parcels POST Error]', error);
    return NextResponse.json({ success: false, message: 'Failed to record parcel', error: error.message }, { status: 500 });
  }
}
