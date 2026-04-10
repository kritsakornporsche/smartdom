import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || '');
    const userResult = await sql`SELECT id, role FROM users WHERE email = ${session.user.email} LIMIT 1`;
    const user = userResult[0];

    let conversations;
    if (user.role === 'owner') {
      conversations = await sql`
        SELECT c.*, u.name as guest_name, u.role as guest_role, d.name as dorm_name
        FROM conversations c
        JOIN users u ON c.guest_id = u.id
        JOIN dormitory_profile d ON c.dorm_id = d.id
        WHERE c.owner_id = ${user.id}
        ORDER BY c.updated_at DESC
      `;
    } else {
      conversations = await sql`
        SELECT c.*, u.name as owner_name, d.name as dorm_name
        FROM conversations c
        JOIN users u ON c.owner_id = u.id
        JOIN dormitory_profile d ON c.dorm_id = d.id
        WHERE c.guest_id = ${user.id}
        ORDER BY c.updated_at DESC
      `;
    }

    return NextResponse.json({ success: true, data: conversations });
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
    const { dormId } = await request.json();
    const sql = neon(process.env.DATABASE_URL || '');
    
    // Get initiating user and their role
    const userResult = await sql`SELECT id, role FROM users WHERE email = ${session.user.email} LIMIT 1`;
    const user = userResult[0];

    // Ensure owners cannot initiate contact themselves
    if (user.role === 'owner') {
      return NextResponse.json({ success: false, message: 'Owners cannot initiate contact with guests themselves' }, { status: 403 });
    }

    const guestId = user.id;

    // Get owner_id from dormId
    const dormResult = await sql`SELECT owner_id FROM dormitory_profile WHERE id = ${dormId} LIMIT 1`;
    if (dormResult.length === 0) {
      return NextResponse.json({ success: false, message: 'Dorm not found' }, { status: 404 });
    }
    const ownerId = dormResult[0].owner_id;

    // Check if conversation already exists
    const existing = await sql`
      SELECT id FROM conversations 
      WHERE guest_id = ${guestId} AND owner_id = ${ownerId} AND dorm_id = ${dormId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({ success: true, data: existing[0] });
    }

    // Create new conversation
    const newConv = await sql`
      INSERT INTO conversations (guest_id, owner_id, dorm_id)
      VALUES (${guestId}, ${ownerId}, ${dormId})
      RETURNING id
    `;

    return NextResponse.json({ success: true, data: newConv[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
