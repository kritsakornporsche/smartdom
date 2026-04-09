import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  const sql = neon(process.env.DATABASE_URL || '');
  
  try {
    const { ownerEmail, dormData, packageId } = await req.json();

    if (!ownerEmail || !dormData || !packageId) {
      return NextResponse.json({ success: false, message: 'Missing required data' }, { status: 400 });
    }

    // 1. Get Owner ID
    const userResult = await sql`SELECT id FROM users WHERE email = ${ownerEmail} LIMIT 1`;
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    const ownerId = userResult[0].id;

    // 2. Create or Update Dormitory Profile
    const dormResult = await sql`
      INSERT INTO dormitory_profile (name, address, phone, owner_id)
      VALUES (${dormData.name}, ${dormData.address}, ${dormData.phone}, ${ownerId})
      ON CONFLICT (name) DO UPDATE SET 
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        owner_id = EXCLUDED.owner_id
      RETURNING id
    `;
    const dormId = dormResult[0].id;

    // 3. Create Subscription
    // Calculate end date (30 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    await sql`
      INSERT INTO subscriptions (owner_id, package_id, status, end_date)
      VALUES (${ownerId}, ${packageId}, 'Active', ${endDate.toISOString()})
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'ตั้งค่าหอพักและแพ็กเกจสำเร็จแล้ว',
      dormId 
    });

  } catch (err: any) {
    console.error('Onboarding Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const sql = neon(process.env.DATABASE_URL || '');
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 });
  }

  try {
    const user = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (user.length === 0) return NextResponse.json({ success: false });

    // Check if user has a dorm and a subscription
    const dorm = await sql`SELECT * FROM dormitory_profile WHERE owner_id = ${user[0].id} LIMIT 1`;
    const subscription = await sql`
      SELECT s.*, p.name as package_name 
      FROM subscriptions s
      JOIN dormitory_packages p ON s.package_id = p.id
      WHERE s.owner_id = ${user[0].id} 
      ORDER BY s.created_at DESC LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      hasDorm: dorm.length > 0,
      hasSubscription: subscription.length > 0,
      dorm: dorm[0] || null,
      subscription: subscription[0] || null
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
