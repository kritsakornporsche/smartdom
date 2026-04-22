import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const convId = searchParams.get('convId');

  if (!convId) {
    return NextResponse.json({ success: false, message: 'Conversation ID required' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Security: Check if user belongs to this conversation
    const userResult = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    const userId = userResult[0].id;

    const convCheck = await sql`
      SELECT id FROM conversations 
      WHERE id = ${convId} AND (guest_id = ${userId} OR owner_id = ${userId})
      LIMIT 1
    `;

    if (convCheck.length === 0) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const messages = await sql`
      SELECT * FROM chat_messages 
      WHERE conversation_id = ${convId} 
      ORDER BY created_at ASC
    `;

    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { conversationId, message } = await request.json();
    const sql = neon(process.env.DATABASE_URL || '');

    const userResult = await sql`SELECT id FROM users WHERE email = ${session.user.email} LIMIT 1`;
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    const userId = userResult[0].id;

    // Security check
    const convCheck = await sql`
      SELECT id FROM conversations 
      WHERE id = ${conversationId} AND (guest_id = ${userId} OR owner_id = ${userId})
      LIMIT 1
    `;

    if (convCheck.length === 0) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const newMessage = await sql`
      INSERT INTO chat_messages (conversation_id, sender_id, message)
      VALUES (${conversationId}, ${userId}, ${message})
      RETURNING *
    `;

    // Update last_message and updated_at in conversations
    await sql`
      UPDATE conversations 
      SET last_message = ${message}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${conversationId}
    `;

    return NextResponse.json({ success: true, data: newMessage[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
