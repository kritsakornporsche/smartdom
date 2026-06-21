import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const MYSQL_BASE = 'mysql://root:@localhost:3306';
const platformSql = neon(`${MYSQL_BASE}/smartdom_platform`);

// Helper: resolve dorm DB from email
async function getDormSql(email: string) {
  // Check dormitory_registry
  const reg = await platformSql`
    SELECT db_name FROM dormitory_registry WHERE owner_email = ${email} AND status = 'Active' LIMIT 1
  `;
  if (reg.length > 0 && reg[0].db_name) {
    return { sql: neon(`${MYSQL_BASE}/${reg[0].db_name}`), dbName: reg[0].db_name };
  }
  // Fallback: search all dorm DBs
  const allDorms = await platformSql`SELECT db_name FROM dormitory_registry WHERE status = 'Active' AND db_name != ''`;
  for (const d of allDorms) {
    try {
      const dormSql = neon(`${MYSQL_BASE}/${d.db_name}`);
      const users = await dormSql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
      if (users.length > 0) return { sql: dormSql, dbName: d.db_name };
    } catch { /* skip */ }
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const dormDbName = searchParams.get('dormDbName');

  if (!email) {
    return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 });
  }

  try {
    // Get all active dormitories registered to this owner
    const ownedDorms = await platformSql`
      SELECT id, dorm_name, db_name FROM dormitory_registry 
      WHERE owner_email = ${email} AND status = 'Active'
    `;

    // Check if they have the Enterprise package active on any of their dorms
    let hasMultiDormPackage = false;
    if (ownedDorms.length > 0) {
      const dormIds = ownedDorms.map(d => d.id);
      const activeSubs = await platformSql`
        SELECT s.package_id, p.name FROM subscriptions s
        JOIN packages p ON s.package_id = p.id
        WHERE s.dormitory_id IN (${dormIds}) AND s.status = 'Active' AND s.end_date > NOW()
      `;
      hasMultiDormPackage = activeSubs.some(sub => sub.package_id === 3 || sub.name.toLowerCase().includes('enterprise'));
    }

    const canAddDorm = ownedDorms.length === 0 || hasMultiDormPackage;

    if (ownedDorms.length === 0) {
      return NextResponse.json({ success: true, hasDorm: false, canAddDorm: true, dorms: [] });
    }

    // Determine which dbName to load details for
    let selectedDbName = dormDbName;
    if (!selectedDbName) {
      selectedDbName = ownedDorms[0].db_name;
    }

    const sql = neon(`${MYSQL_BASE}/${selectedDbName}`);
    const user = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    const dorm = await sql`SELECT * FROM dormitory_profile LIMIT 1`;
    
    // Get subscription for this specific dorm
    let subscription = null;
    if (selectedDbName) {
      const subs = await platformSql`
        SELECT s.*, p.name as package_name 
        FROM subscriptions s
        JOIN packages p ON s.package_id = p.id
        JOIN dormitory_registry d ON s.dormitory_id = d.id
        WHERE d.db_name = ${selectedDbName}
        ORDER BY s.created_at DESC LIMIT 1
      `;
      subscription = subs[0] || null;
    }

    return NextResponse.json({
      success: true,
      hasDorm: true,
      dorms: ownedDorms,
      canAddDorm,
      dorm: dorm[0] || null,
      subscription,
      dormDbName: selectedDbName,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { ownerEmail, dormData, packageId } = await req.json();
    if (!ownerEmail || !dormData || !packageId) {
      return NextResponse.json({ success: false, message: 'Missing required data' }, { status: 400 });
    }

    // Check existing active dorms for this owner
    const existingDorms = await platformSql`
      SELECT id, db_name FROM dormitory_registry WHERE owner_email = ${ownerEmail} AND status = 'Active'
    `;

    if (existingDorms.length > 0) {
      // They already have at least one dorm. Check if they have the Enterprise package active on any of them.
      const dormIds = existingDorms.map(d => d.id);
      const activeSubs = await platformSql`
        SELECT s.package_id, p.name FROM subscriptions s
        JOIN packages p ON s.package_id = p.id
        WHERE s.dormitory_id IN (${dormIds}) AND s.status = 'Active' AND s.end_date > NOW()
      `;
      const hasMultiDormPackage = activeSubs.some(sub => sub.package_id === 3 || sub.name.toLowerCase().includes('enterprise'));
      
      if (!hasMultiDormPackage) {
        return NextResponse.json({ 
          success: false, 
          message: 'คุณต้องใช้แพ็กเกจ Enterprise (Multi-Dorm Management) เพื่อสร้างหอพักเพิ่มเติม' 
        }, { status: 400 });
      }
    }

    // Create new dorm: provision database
    const [maxId] = await platformSql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM dormitory_registry`;
    const nextId = maxId.next_id;
    const dbName = `smartdom_dorm_${nextId}`;

    // Register in platform
    const reg = await platformSql`
      INSERT INTO dormitory_registry (owner_email, owner_name, dorm_name, db_name, phone, address, status, approved_at)
      VALUES (${ownerEmail}, ${dormData.ownerName || ownerEmail}, ${dormData.name}, ${dbName}, ${dormData.phone || ''}, ${dormData.address || ''}, 'Active', NOW())
      RETURNING id
    `;
    const dormRegistryId = reg[0].id;

    // Provision the database
    const { provisionDormDb } = require('../../../../scripts/provision-dorm-db');
    await provisionDormDb(dbName);

    // Create owner user in the new dorm DB
    const dormSql = neon(`${MYSQL_BASE}/${dbName}`);
    const bcrypt = require('bcryptjs');
    
    await dormSql`
      INSERT INTO users (email, password, name, role)
      VALUES (${ownerEmail}, ${await bcrypt.hash('temp_password', 12)}, ${dormData.ownerName || 'Owner'}, 'owner')
      ON CONFLICT (email) DO NOTHING
    `;

    // Create dormitory profile
    const ownerId = await dormSql`SELECT id FROM users WHERE email = ${ownerEmail} LIMIT 1`;
    await dormSql`
      INSERT INTO dormitory_profile (name, address, phone, owner_id)
      VALUES (${dormData.name}, ${dormData.address || ''}, ${dormData.phone || ''}, ${ownerId[0]?.id || 1})
    `;

    // Create subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    await platformSql`
      INSERT INTO subscriptions (dormitory_id, package_id, status, end_date, amount_paid)
      VALUES (${dormRegistryId}, ${packageId}, 'Active', ${endDate.toISOString().replace('T', ' ').substring(0, 19)}, 0)
    `;

    return NextResponse.json({
      success: true,
      message: 'ตั้งค่าหอพักสำเร็จ',
      dormDbName: dbName,
      dormId: dormRegistryId,
    });
  } catch (err: any) {
    console.error('Onboarding Error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
