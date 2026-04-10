import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dormId = searchParams.get('dormId');

    if (!dormId) {
      return NextResponse.json({ success: false, message: 'Missing dormId' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, position, dorm_id, password } = body;

    if (!name || !position || !dorm_id) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    
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
    const userId = userResult[0].id;

    // 2. Create Keeper Record
    const result = await sql`
      INSERT INTO keepers (name, email, phone, position, dorm_id, user_id)
      VALUES (${name}, ${email || null}, ${phone || null}, ${position}, ${dorm_id}, ${userId})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, phone, position } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL || '');
    await sql`DELETE FROM keepers WHERE id = ${parseInt(id)}`;

    return NextResponse.json({ success: true, message: 'Keeper deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
