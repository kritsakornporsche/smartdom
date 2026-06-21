/**
 * scripts/migrate-to-multidb.js
 * One-time migration: smartdomdb → smartdom_platform + smartdom_dorm_N
 *
 * What it does:
 *  1. Sets up smartdom_platform DB
 *  2. For each dormitory in the old DB, creates smartdom_dorm_N and migrates its data
 *  3. Registers each dorm in platform dormitory_registry
 *  4. Migrates packages and subscriptions to platform DB
 *
 * Run: node scripts/migrate-to-multidb.js
 */
const mysql = require('mysql2/promise');
const { provisionDormDb } = require('./provision-dorm-db');
require('dotenv').config({ path: '.env.local' });

const MYSQL_BASE = 'mysql://root:@localhost:3306';
const SOURCE_DB = 'smartdomdb';
const PLATFORM_DB = 'smartdom_platform';

async function migrate() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  SmartDom Multi-DB Migration');
  console.log('  Source: smartdomdb → Platform + Per-Dorm DBs');
  console.log('═══════════════════════════════════════════════════\n');

  // ── Step 1: Setup platform DB ─────────────────────────────────────────────
  console.log('Phase 1: Setting up Platform Database...');
  const { execSync } = require('child_process');
  execSync('node setup-platform-db.js', { stdio: 'inherit' });

  // ── Connect to source (old) DB ────────────────────────────────────────────
  const src = await mysql.createConnection(`${MYSQL_BASE}/${SOURCE_DB}`);
  await src.query(`SET SESSION sql_mode='ANSI_QUOTES,STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'`);

  const plt = await mysql.createConnection(`${MYSQL_BASE}/${PLATFORM_DB}`);
  await plt.query(`SET SESSION sql_mode='ANSI_QUOTES,STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'`);

  // ── Step 2: Migrate packages to platform ──────────────────────────────────
  console.log('\nPhase 2: Migrating packages to platform...');
  try {
    const [packages] = await src.query(`SELECT * FROM dormitory_packages`);
    for (const pkg of packages) {
      const [existing] = await plt.query(`SELECT id FROM packages WHERE name = ?`, [pkg.name]);
      if (existing.length === 0) {
        await plt.query(
          `INSERT INTO packages (name, price, max_rooms, duration_days, features) VALUES (?, ?, ?, ?, ?)`,
          [pkg.name, pkg.price, pkg.max_rooms, pkg.duration_days || 30, pkg.features]
        );
        console.log(`  ✅ Package migrated: ${pkg.name}`);
      }
    }
  } catch (e) {
    console.log('  ⚠️  No dormitory_packages table or migration failed:', e.message);
  }

  // ── Step 3: Migrate each dormitory ────────────────────────────────────────
  console.log('\nPhase 3: Migrating dormitories...');
  const [dorms] = await src.query(`SELECT * FROM dormitory_profile ORDER BY id`);
  console.log(`  Found ${dorms.length} dormitories to migrate`);

  for (const dorm of dorms) {
    const dbName = `smartdom_dorm_${dorm.id}`;
    console.log(`\n  🏗️  Processing dorm "${dorm.name}" → ${dbName}`);

    // Get owner info
    const [owners] = await src.query(`SELECT * FROM users WHERE id = ?`, [dorm.owner_id]);
    const owner = owners[0];
    if (!owner) {
      console.log(`    ⚠️  Owner not found for dorm ${dorm.id}, skipping`);
      continue;
    }

    // Provision per-dorm DB
    await provisionDormDb(dbName);

    const dconn = await mysql.createConnection(`${MYSQL_BASE}/${dbName}`);
    await dconn.query(`SET SESSION sql_mode='ANSI_QUOTES,STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'`);
    await dconn.query(`SET FOREIGN_KEY_CHECKS = 0`);

    // ── Get all users for this dorm ─────────────────────────────────────────
    // Users belonging to this dorm: owner + tenants/keepers via rooms in this dorm
    const [dormRooms] = await src.query(`SELECT id FROM rooms WHERE dorm_id = ?`, [dorm.id]);
    const roomIds = dormRooms.map(r => r.id);

    // Get all tenant user_ids for this dorm
    let dormUserIds = new Set([dorm.owner_id]);
    if (roomIds.length > 0) {
      const [dormTenants] = await src.query(
        `SELECT user_id FROM tenants WHERE room_id IN (${roomIds.map(() => '?').join(',')}) AND user_id IS NOT NULL`,
        roomIds
      );
      dormTenants.forEach(t => dormUserIds.add(t.user_id));
    }

    // Get keeper user_ids for this dorm
    try {
      const [dormKeepers] = await src.query(
        `SELECT user_id FROM keepers WHERE dorm_id = ? AND user_id IS NOT NULL`,
        [dorm.id]
      );
      dormKeepers.forEach(k => dormUserIds.add(k.user_id));
    } catch (e) { /* keepers may not exist */ }

    // Migrate users
    const userIdMapping = {};  // old_id → new_id (should be same but track just in case)
    if (dormUserIds.size > 0) {
      const ids = Array.from(dormUserIds);
      const [srcUsers] = await src.query(
        `SELECT * FROM users WHERE id IN (${ids.map(() => '?').join(',')})`,
        ids
      );
      for (const u of srcUsers) {
        await dconn.query(
          `INSERT IGNORE INTO users (id, email, password, name, role, sub_role, phone, image_url, bio, is_active, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.id, u.email, u.password, u.name, u.role === 'admin' ? 'owner' : u.role,
           u.sub_role, u.phone, u.image_url, u.bio, u.is_active ?? 1, formatDate(u.created_at)]
        );
        userIdMapping[u.id] = u.id;
      }
      console.log(`    ✅ Users migrated: ${srcUsers.length}`);
    }

    // Migrate dormitory_profile (1 record)
    await dconn.query(
      `INSERT IGNORE INTO dormitory_profile (id, name, address, phone, tax_id, owner_id, water_rate, electricity_rate,
       has_wifi, has_parking, pet_friendly, has_lan, facilities, map_url, created_at)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dorm.name, dorm.address, dorm.phone, dorm.tax_id, dorm.owner_id,
       dorm.water_rate || 18, dorm.electricity_rate || 8,
       dorm.has_wifi ? 1 : 0, dorm.has_parking ? 1 : 0, dorm.pet_friendly ? 1 : 0, dorm.has_lan ? 1 : 0,
       dorm.facilities, dorm.map_url, formatDate(dorm.created_at)]
    );

    // Migrate rooms
    if (roomIds.length > 0) {
      const [srcRooms] = await src.query(`SELECT * FROM rooms WHERE dorm_id = ?`, [dorm.id]);
      for (const r of srcRooms) {
        await dconn.query(
          `INSERT IGNORE INTO rooms (id, room_number, room_type, price, status, floor, tenant_id, image_url, images, amenities, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [r.id, r.room_number, r.room_type, r.price, r.status || 'Available', r.floor || 1,
           r.tenant_id, r.image_url,
           Array.isArray(r.images) ? JSON.stringify(r.images) : r.images,
           Array.isArray(r.amenities) ? JSON.stringify(r.amenities) : r.amenities,
           formatDate(r.created_at)]
        );
      }
      console.log(`    ✅ Rooms migrated: ${srcRooms.length}`);
    }

    // Migrate tenants
    if (roomIds.length > 0) {
      const [srcTenants] = await src.query(
        `SELECT * FROM tenants WHERE room_id IN (${roomIds.map(() => '?').join(',')})`,
        roomIds
      );
      for (const t of srcTenants) {
        await dconn.query(
          `INSERT IGNORE INTO tenants (id, name, email, phone, room_id, user_id, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [t.id, t.name, t.email, t.phone, t.room_id, t.user_id, t.status || 'Active', formatDate(t.created_at)]
        );
      }
      console.log(`    ✅ Tenants migrated: ${srcTenants.length}`);
    }

    // Migrate contracts
    try {
      const [srcContracts] = await src.query(
        `SELECT * FROM contracts WHERE room_id IN (${roomIds.length ? roomIds.map(() => '?').join(',') : '0'})`,
        roomIds.length ? roomIds : []
      );
      for (const c of srcContracts) {
        await dconn.query(
          `INSERT IGNORE INTO contracts (id, tenant_id, room_id, start_date, end_date, deposit_amount, status,
           signature_data, owner_signature_data, signed_at, contract_terms, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [c.id, c.tenant_id, c.room_id, formatDate(c.start_date), formatDate(c.end_date),
           c.deposit_amount, c.status, c.signature_data, c.owner_signature_data,
           formatDate(c.signed_at), c.contract_terms, formatDate(c.created_at)]
        );
      }
      if (srcContracts.length) console.log(`    ✅ Contracts migrated: ${srcContracts.length}`);
    } catch (e) { console.log(`    ⚠️  Contracts: ${e.message}`); }

    // Migrate bills
    try {
      const [srcBills] = await src.query(
        `SELECT b.* FROM bills b
         JOIN tenants t ON b.tenant_id = t.id
         WHERE t.room_id IN (${roomIds.length ? roomIds.map(() => '?').join(',') : '0'})`,
        roomIds.length ? roomIds : []
      );
      for (const b of srcBills) {
        await dconn.query(
          `INSERT IGNORE INTO bills (id, tenant_id, title, amount, billing_cycle, due_date, status, slip_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [b.id, b.tenant_id, b.title, b.amount, b.billing_cycle,
           b.due_date ? b.due_date.toString().substring(0,10) : null,
           b.status, b.slip_url, formatDate(b.created_at)]
        );
      }
      if (srcBills.length) console.log(`    ✅ Bills migrated: ${srcBills.length}`);
    } catch (e) { console.log(`    ⚠️  Bills: ${e.message}`); }

    // Migrate maintenance requests
    try {
      const [srcMaint] = await src.query(
        `SELECT m.* FROM maintenance_requests m
         JOIN tenants t ON m.tenant_id = t.id
         WHERE t.room_id IN (${roomIds.length ? roomIds.map(() => '?').join(',') : '0'})`,
        roomIds.length ? roomIds : []
      );
      for (const m of srcMaint) {
        await dconn.query(
          `INSERT IGNORE INTO maintenance_requests (id, tenant_id, room_number, issue_type, description, status, image_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [m.id, m.tenant_id, m.room_number, m.issue_type, m.description, m.status, m.image_url, formatDate(m.created_at)]
        );
      }
      if (srcMaint.length) console.log(`    ✅ Maintenance requests migrated: ${srcMaint.length}`);
    } catch (e) { console.log(`    ⚠️  Maintenance requests: ${e.message}`); }

    // Migrate announcements
    try {
      const [srcAnn] = await src.query(`SELECT * FROM announcements`);
      for (const a of srcAnn) {
        await dconn.query(
          `INSERT IGNORE INTO announcements (id, title, content, is_important, created_at) VALUES (?, ?, ?, ?, ?)`,
          [a.id, a.title, a.content, a.is_important ? 1 : 0, formatDate(a.created_at)]
        );
      }
      if (srcAnn.length) console.log(`    ✅ Announcements migrated: ${srcAnn.length}`);
    } catch (e) { /* skip */ }

    // Migrate keepers
    try {
      const [srcKeepers] = await src.query(`SELECT * FROM keepers WHERE dorm_id = ?`, [dorm.id]);
      for (const k of srcKeepers) {
        await dconn.query(
          `INSERT IGNORE INTO keepers (id, name, email, phone, position, user_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [k.id, k.name, k.email, k.phone, k.position || 'Maid', k.user_id, formatDate(k.created_at)]
        );
      }
      if (srcKeepers.length) console.log(`    ✅ Keepers migrated: ${srcKeepers.length}`);
    } catch (e) { /* skip */ }

    // Migrate accounting_transactions
    try {
      const [srcAccounting] = await src.query(`SELECT * FROM accounting_transactions WHERE dorm_id = ?`, [dorm.id]);
      for (const a of srcAccounting) {
        await dconn.query(
          `INSERT IGNORE INTO accounting_transactions (id, type, category, amount, description, transaction_date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [a.id, a.transaction_type || a.type, a.category, a.amount, a.description,
           a.transaction_date ? a.transaction_date.toString().substring(0,10) : new Date().toISOString().substring(0,10),
           formatDate(a.created_at)]
        );
      }
      if (srcAccounting.length) console.log(`    ✅ Accounting transactions migrated: ${srcAccounting.length}`);
    } catch (e) { /* skip */ }

    await dconn.query(`SET FOREIGN_KEY_CHECKS = 1`);
    await dconn.end();

    // ── Register in platform dormitory_registry ─────────────────────────────
    const [existingReg] = await plt.query(`SELECT id FROM dormitory_registry WHERE db_name = ?`, [dbName]);
    if (existingReg.length === 0) {
      await plt.query(
        `INSERT INTO dormitory_registry (owner_email, owner_name, dorm_name, db_name, phone, address, status, approved_at)
         VALUES (?, ?, ?, ?, ?, ?, 'Active', NOW())`,
        [owner.email, owner.name, dorm.name, dbName, dorm.phone, dorm.address]
      );
    }

    // ── Migrate subscription for this dorm ────────────────────────────────────
    try {
      const [srcSubs] = await src.query(
        `SELECT s.*, p.name as pkg_name FROM subscriptions s
         LEFT JOIN dormitory_packages p ON s.package_id = p.id
         WHERE s.owner_id = ? ORDER BY s.created_at DESC LIMIT 1`,
        [dorm.owner_id]
      );
      if (srcSubs.length > 0) {
        const sub = srcSubs[0];
        const [regRow] = await plt.query(`SELECT id FROM dormitory_registry WHERE db_name = ?`, [dbName]);
        const [pkgRow] = await plt.query(`SELECT id FROM packages WHERE name = ?`, [sub.pkg_name || 'Starter']);
        if (regRow.length > 0 && pkgRow.length > 0) {
          await plt.query(
            `INSERT INTO subscriptions (dormitory_id, package_id, status, start_date, end_date, amount_paid)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [regRow[0].id, pkgRow[0].id, sub.status || 'Active',
             formatDate(sub.start_date), formatDate(sub.end_date),
             pkgRow[0].price ?? 0]
          );
          console.log(`    ✅ Subscription migrated: ${sub.pkg_name}`);
        }
      }
    } catch (e) { console.log(`    ⚠️  Subscription: ${e.message}`); }

    console.log(`  ✅ Dorm "${dorm.name}" migration complete → ${dbName}`);
  }

  await src.end();
  await plt.end();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ✅ Migration Complete!');
  console.log(`  Platform DB: ${PLATFORM_DB}`);
  console.log(`  Dorm DBs: smartdom_dorm_1 → smartdom_dorm_${dorms.length}`);
  console.log('═══════════════════════════════════════════════════\n');
  console.log('Next step: Update .env.local and restart the dev server.');
}

function formatDate(val) {
  if (!val) return null;
  if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return val.replace('T', ' ').replace(/\.\d+Z$/, '').replace(/Z$/, '');
  }
  if (val instanceof Date) {
    return val.toISOString().replace('T', ' ').substring(0, 19);
  }
  return val;
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
