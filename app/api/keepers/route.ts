import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/auth';

// Helper to check if the user requesting owns the dorm they are trying to access
async function verifyOwnerAccess(sql: any, userId: number, checkDormId?: number, checkKeeperId?: number) {
  if (checkDormId) {
    const verifiedDorm = await sql`SELECT id FROM dormitory_profile WHERE owner_id = ${userId} AND id = ${checkDormId}`;
    return verifiedDorm.length > 0;
  }
  if (checkKeeperId) {
    const verifiedKeeper = await sql`
      SELECT k.id 
      FROM keepers k
      JOIN dormitory_profile d ON k.dorm_id = d.id
      WHERE k.id = ${checkKeeperId} AND d.owner_id = ${userId}
    `;
    return verifiedKeeper.length > 0;
  }
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const { searchParams } = new URL(request.url);
    const dormId = searchParams.get('dormId');

    if (!dormId) {
      return NextResponse.json({ success: false, message: 'Missing dormId' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Verify Ownership
    const isOwner = await verifyOwnerAccess(sql, userId, parseInt(dormId));
    if (!isOwner) {
      return NextResponse.json({ success: false, message: 'Forbidden: You do not own this dormitory' }, { status: 403 });
    }

    const keepers = await sql`
      SELECT * FROM keepers 
      WHERE dorm_id = ${parseInt(dormId)}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, data: keepers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const body = await request.json();
    const { name, email, phone, position, dorm_id, password } = body;

    if (!name || !position || !dorm_id) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Verify Ownership
    const isOwner = await verifyOwnerAccess(sql, userId, parseInt(dorm_id));
    if (!isOwner) {
      return NextResponse.json({ success: false, message: 'Forbidden: You do not own this dormitory' }, { status: 403 });
    }
    
    // Helper to hash password (SHA-256 to match signup logic)
    const hashPassword = async (pass: string) => {
      const encoder = new TextEncoder();
      const dataArr = encoder.encode(pass);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataArr);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const hashedPassword = await hashPassword(password || 'keeper123');

    // 1. Create User Record
    const userResult = await sql`
      INSERT INTO users (email, password, name, role)
      VALUES (${email}, ${hashedPassword}, ${name}, 'keeper')
      RETURNING id
    `;
    const newUserId = userResult[0].id;

    // 2. Create Keeper Record
    const result = await sql`
      INSERT INTO keepers (name, email, phone, position, dorm_id, user_id)
      VALUES (${name}, ${email || null}, ${phone || null}, ${position}, ${dorm_id}, ${newUserId})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const body = await request.json();
    const { id, name, email, phone, position } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
    // Verify Ownership
    const isOwner = await verifyOwnerAccess(sql, userId, undefined, parseInt(id));
    if (!isOwner) {
      return NextResponse.json({ success: false, message: 'Forbidden: You do not have permission to edit this keeper' }, { status: 403 });
    }

    const result = await sql`
      UPDATE keepers 
      SET name = ${name}, email = ${email}, phone = ${phone}, position = ${position}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'owner') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');

    // Verify Ownership
    const isOwner = await verifyOwnerAccess(sql, userId, undefined, parseInt(id));
    if (!isOwner) {
      return NextResponse.json({ success: false, message: 'Forbidden: You do not have permission to delete this keeper' }, { status: 403 });
    }

    await sql`DELETE FROM keepers WHERE id = ${parseInt(id)}`;

    return NextResponse.json({ success: true, message: 'Keeper deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
