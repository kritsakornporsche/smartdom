import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const dormDbName = searchParams.get('dormDbName'); // Now this acts as dorm_id

  if (!email) {
    return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 });
  }

  try {
    const sql = getDb();
    
    // Get user id from email
    const users = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (users.length === 0) {
       return NextResponse.json({ success: true, hasDorm: false, canAddDorm: true, dorms: [], maxAllowedDorms: 1 });
    }
    const ownerId = users[0].id;

    // Get all active dormitories registered to this owner
    // We map id to db_name so the frontend OwnerSidebar doesn't break
    const ownedDorms = await sql`
      SELECT id, dorm_name, CAST(id AS CHAR) as db_name 
      FROM dormitory_registry 
      WHERE owner_id = ${ownerId} AND status = 'Active'
    `;

    let maxAllowedDorms = 1;
    if (ownedDorms.length > 0) {
      const dormIds = ownedDorms.map((d: any) => d.id);
      const activeSubs = await sql`
        SELECT s.package_id, p.max_dorms FROM subscriptions s
        JOIN packages p ON s.package_id = p.id
        WHERE s.dormitory_id IN (${dormIds}) AND s.status = 'Active' AND s.end_date > NOW()
      `;
      if (activeSubs.length > 0) {
        maxAllowedDorms = Math.max(...activeSubs.map((sub: any) => sub.max_dorms || 1));
      }
    }

    const canAddDorm = ownedDorms.length < maxAllowedDorms;

    if (ownedDorms.length === 0) {
      return NextResponse.json({ success: true, hasDorm: false, canAddDorm: true, dorms: [], maxAllowedDorms });
    }

    // Determine which dorm_id to load details for
    let selectedDormId = dormDbName ? parseInt(dormDbName) : ownedDorms[0].id;
    if (isNaN(selectedDormId)) selectedDormId = ownedDorms[0].id;

    const dorm = await sql`SELECT * FROM dormitory_profile WHERE dorm_id = ${selectedDormId} LIMIT 1`;
    
    // Get subscription for this specific dorm
    const subs = await sql`
      SELECT s.*, p.name as package_name 
      FROM subscriptions s
      JOIN packages p ON s.package_id = p.id
      WHERE s.dormitory_id = ${selectedDormId}
      ORDER BY s.created_at DESC LIMIT 1
    `;
    const subscription = subs[0] || null;

    return NextResponse.json({
      success: true,
      hasDorm: true,
      dorms: ownedDorms,
      canAddDorm,
      maxAllowedDorms,
      dorm: dorm[0] || null,
      subscription,
      dormDbName: selectedDormId.toString(),
    });
  } catch (err: any) {
    console.error('GET Onboarding Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { ownerEmail, dormData, packageId } = await req.json();
    if (!ownerEmail || !dormData) {
      return NextResponse.json({ success: false, message: 'Missing required data' }, { status: 400 });
    }

    const sql = getDb();
    const finalPackageId = packageId || 1;

    // Get user id
    let users = await sql`SELECT id FROM users WHERE email = ${ownerEmail} LIMIT 1`;
    let ownerId;
    if (users.length === 0) {
      // Create owner user if not exist
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('temp_password', 12);
      const res = await sql`
        INSERT INTO users (email, password, name, primary_role)
        VALUES (${ownerEmail}, ${hash}, ${dormData.ownerName || 'Owner'}, 'owner')
      `;
      ownerId = (res as any).insertId;
    } else {
      ownerId = users[0].id;
    }

    // Check existing active dorms for this owner
    const existingDorms = await sql`
      SELECT id FROM dormitory_registry WHERE owner_id = ${ownerId} AND status = 'Active'
    `;

    if (existingDorms.length > 0) {
      const dormIds = existingDorms.map((d: any) => d.id);
      const activeSubs = await sql`
        SELECT s.package_id, p.max_dorms FROM subscriptions s
        JOIN packages p ON s.package_id = p.id
        WHERE s.dormitory_id IN (${dormIds}) AND s.status = 'Active' AND s.end_date > NOW()
      `;
      let maxAllowedDorms = 1;
      if (activeSubs.length > 0) {
        maxAllowedDorms = Math.max(...activeSubs.map((sub: any) => sub.max_dorms || 1));
      }
      
      if (existingDorms.length >= maxAllowedDorms) {
        return NextResponse.json({ 
          success: false, 
          message: `คุณถึงขีดจำกัดจำนวนหอพักสำหรับแพ็กเกจปัจจุบันแล้ว (สูงสุด ${maxAllowedDorms} หอพัก)` 
        }, { status: 400 });
      }
    }

    // Register in dormitory_registry
    const reg = await sql`
      INSERT INTO dormitory_registry (owner_id, dorm_name, phone, address, status, approved_at)
      VALUES (${ownerId}, ${dormData.name}, ${dormData.phone || ''}, ${dormData.address || ''}, 'Active', NOW())
    `;
    const dormRegistryId = (reg as any).insertId;

    // Create user_dorm_role
    await sql`
      INSERT INTO user_dorm_roles (user_id, dorm_id, role)
      VALUES (${ownerId}, ${dormRegistryId}, 'owner')
    `;

    // Create dormitory profile
    await sql`
      INSERT INTO dormitory_profile (
        dorm_id, water_rate, electricity_rate,
        has_wifi, has_parking, pet_friendly, has_lan,
        has_air_con, facilities
      )
      VALUES (
        ${dormRegistryId}, ${dormData.water_rate || 18.0}, ${dormData.electricity_rate || 8.0},
        ${dormData.has_wifi ? 1 : 0}, ${dormData.has_parking ? 1 : 0}, ${dormData.pet_friendly ? 1 : 0}, ${dormData.has_lan ? 1 : 0},
        ${dormData.has_air_con ? 1 : 0}, ${dormData.facilities || ''}
      )
    `;

    // Create subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    await sql`
      INSERT INTO subscriptions (dormitory_id, package_id, status, end_date, amount_paid)
      VALUES (${dormRegistryId}, ${finalPackageId}, 'Active', ${endDate.toISOString().replace('T', ' ').substring(0, 19)}, 0)
    `;

    return NextResponse.json({
      success: true,
      message: 'ตั้งค่าหอพักสำเร็จ',
      dormDbName: dormRegistryId.toString(),
      dormId: dormRegistryId,
    });
  } catch (err: any) {
    console.error('POST Onboarding Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
