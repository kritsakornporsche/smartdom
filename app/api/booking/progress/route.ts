import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ success: false, message: 'Room ID is required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    const progress = await sql`
      SELECT current_step, booking_data 
      FROM booking_progress 
      WHERE user_email = ${session.user.email} AND room_id = ${parseInt(roomId)}
    `;

    if (progress.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: progress[0] });
  } catch (error: any) {
    console.error('[Get Progress Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, currentStep, bookingData } = await request.json();

    if (!roomId || !currentStep) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    await sql`
      INSERT INTO booking_progress (user_email, room_id, current_step, booking_data, updated_at)
      VALUES (${session.user.email}, ${roomId}, ${currentStep}, ${JSON.stringify(bookingData)}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_email, room_id) 
      DO UPDATE SET 
        current_step = EXCLUDED.current_step,
        booking_data = EXCLUDED.booking_data,
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true, message: 'Progress saved successfully' });
  } catch (error: any) {
    console.error('[Save Progress Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await request.json();

    const sql = neon(process.env.DATABASE_URL || '');
    
    await sql`
      DELETE FROM booking_progress 
      WHERE user_email = ${session.user.email} AND room_id = ${roomId}
    `;

    return NextResponse.json({ success: true, message: 'Progress cleared successfully' });
  } catch (error: any) {
    console.error('[Clear Progress Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
