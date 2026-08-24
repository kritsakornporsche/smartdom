import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    const sql = getDb();

    // 1. Get user id
    const userRes = await sql`SELECT id, name, role, email FROM users WHERE email = ${email} LIMIT 1`;
    if (userRes.length === 0) {
      const allDorms = await sql`SELECT id, dorm_name, address FROM dormitory_registry LIMIT 5`;
      return NextResponse.json({ success: true, dorms: allDorms, activeDorm: allDorms[0] });
    }

    const userId = userRes[0].id;

    // 2. Fetch assigned dormitories from keeper_dormitories
    let dorms = await sql`
      SELECT d.id, d.dorm_name, d.address, d.phone
      FROM keeper_dormitories kd
      JOIN dormitory_registry d ON kd.dorm_id = d.id
      WHERE kd.user_id = ${userId}
      ORDER BY d.id ASC
    `;

    // 3. If none in keeper_dormitories, check keepers table
    if (dorms.length === 0) {
      dorms = await sql`
        SELECT d.id, d.dorm_name, d.address, d.phone
        FROM keepers k
        JOIN dormitory_registry d ON k.dorm_id = d.id
        WHERE k.email = ${email} OR k.user_id = ${userId}
        ORDER BY d.id ASC
      `;
    }

    // 4. Default fallback if still empty
    if (dorms.length === 0) {
      dorms = await sql`SELECT id, dorm_name, address, phone FROM dormitory_registry WHERE id IN (1, 2)`;
    }

    return NextResponse.json({
      success: true,
      dorms,
      totalAssigned: dorms.length,
      activeDorm: dorms[0] || null,
    });
  } catch (error: any) {
    console.error('[Keeper Dorms API Error]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
