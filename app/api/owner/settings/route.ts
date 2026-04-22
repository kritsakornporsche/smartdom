import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    const userResult = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    const ownerId = userResult[0].id;
    const dormResult = await sql`SELECT * FROM dormitory_profile WHERE owner_id = ${ownerId} LIMIT 1`;

    if (dormResult.length === 0) {
      return NextResponse.json({ success: false, message: 'Dormitory not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: dormResult[0] });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    const userResult = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    const ownerId = userResult[0].id;
    const updateData = await req.json();

    const result = await sql`
      UPDATE dormitory_profile 
      SET 
        name = ${updateData.name},
        address = ${updateData.address},
        phone = ${updateData.phone},
        water_rate = ${updateData.water_rate || 0},
        electricity_rate = ${updateData.electricity_rate || 0},
        pet_friendly = ${!!updateData.pet_friendly},
        has_wifi = ${!!updateData.has_wifi},
        has_lan = ${!!updateData.has_lan},
        has_parking = ${!!updateData.has_parking},
        facilities = ${updateData.facilities || ''},
        map_url = ${updateData.map_url || ''}
      WHERE owner_id = ${ownerId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: 'Update failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'อัปเดตข้อมูลหอพักสำเร็จ', data: result[0] });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
