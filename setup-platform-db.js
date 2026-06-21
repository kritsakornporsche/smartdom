/**
 * setup-platform-db.js
 * Creates the smartdom_platform database and all its tables.
 * Run: node setup-platform-db.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const PLATFORM_DB = 'smartdom_platform';
const MYSQL_URL = 'mysql://root:@localhost:3306';

async function setupPlatformDb() {
  // Connect without selecting a DB first
  const initConn = await mysql.createConnection(`${MYSQL_URL}/`);
  console.log('🚀 Creating platform database...');
  await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${PLATFORM_DB}\``);
  await initConn.end();

  // Now connect to the platform DB
  const conn = await mysql.createConnection(`${MYSQL_URL}/${PLATFORM_DB}`);
  await conn.query(`SET SESSION sql_mode='ANSI_QUOTES,STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'`);

  console.log('📦 Creating platform tables...');

  // ── Platform Admins ────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS platform_admins (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      email       VARCHAR(255) UNIQUE NOT NULL,
      password    VARCHAR(255) NOT NULL,
      name        VARCHAR(255) NOT NULL,
      role        ENUM('super_admin','support') DEFAULT 'super_admin',
      is_active   BOOLEAN DEFAULT TRUE,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Dormitory Registry (platform view of each dorm) ───────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS dormitory_registry (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      owner_email  VARCHAR(255) UNIQUE NOT NULL,
      owner_name   VARCHAR(255) NOT NULL,
      dorm_name    VARCHAR(255) NOT NULL,
      db_name      VARCHAR(100) UNIQUE NOT NULL,
      phone        VARCHAR(50),
      address      TEXT,
      status       ENUM('Active','Suspended','Cancelled') DEFAULT 'Active',
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at  TIMESTAMP NULL
    )
  `);

  // ── Packages ───────────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS packages (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(100) NOT NULL,
      price         DECIMAL(10,2) NOT NULL,
      max_rooms     INT NOT NULL,
      features      LONGTEXT,
      duration_days INT DEFAULT 30,
      is_active     BOOLEAN DEFAULT TRUE,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Subscriptions ─────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      dormitory_id     INT NOT NULL,
      package_id       INT NOT NULL,
      status           ENUM('Active','Expired','Cancelled','Pending') DEFAULT 'Active',
      start_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_date         TIMESTAMP NULL,
      amount_paid      DECIMAL(10,2) DEFAULT 0,
      payment_method   VARCHAR(50) DEFAULT 'manual',
      notes            TEXT,
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dormitory_id) REFERENCES dormitory_registry(id),
      FOREIGN KEY (package_id) REFERENCES packages(id)
    )
  `);

  // ── Platform Accounting ───────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS platform_accounting (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      type             ENUM('Income','Refund','Adjustment','Expense') NOT NULL,
      category         VARCHAR(100) DEFAULT 'Subscription',
      amount           DECIMAL(10,2) NOT NULL,
      description      TEXT,
      dormitory_id     INT NULL,
      subscription_id  INT NULL,
      transaction_date DATE NOT NULL,
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dormitory_id) REFERENCES dormitory_registry(id)
    )
  `);

  // ── Platform Activity Log ─────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS platform_activity_log (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      admin_id    INT NULL,
      action      VARCHAR(100) NOT NULL,
      target_type VARCHAR(50),
      target_id   INT NULL,
      details     LONGTEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Seed Packages ─────────────────────────────────────────────────────────
  console.log('🌱 Seeding default packages...');
  const packages = [
    {
      name: 'Starter',
      price: 0,
      max_rooms: 10,
      duration_days: 30,
      features: JSON.stringify(['จัดการได้สูงสุด 10 ห้อง', 'ระบบจัดการผู้เช่าพื้นฐาน', 'รายงานสรุปบิลประจำเดือน']),
    },
    {
      name: 'Professional',
      price: 990,
      max_rooms: 50,
      duration_days: 30,
      features: JSON.stringify(['จัดการได้สูงสุด 50 ห้อง', 'ระบบแจ้งซ่อมอัตโนมัติ', 'ระบบบัญชีเต็มรูปแบบ', 'Line Notification สำหรับผู้เช่า']),
    },
    {
      name: 'Enterprise',
      price: 2490,
      max_rooms: 9999,
      duration_days: 30,
      features: JSON.stringify(['ไม่จำกัดจำนวนห้อง', 'ทุกฟีเจอร์จาก Pro', 'ซัพพอร์ตระดับ VIP 24/7', 'ระบบจองห้องออนไลน์ผ่านเว็บ']),
    },
  ];

  for (const pkg of packages) {
    const [existing] = await conn.query(`SELECT id FROM packages WHERE name = ?`, [pkg.name]);
    if (existing.length === 0) {
      await conn.query(
        `INSERT INTO packages (name, price, max_rooms, duration_days, features) VALUES (?, ?, ?, ?, ?)`,
        [pkg.name, pkg.price, pkg.max_rooms, pkg.duration_days, pkg.features]
      );
    }
  }

  // ── Seed Platform Admin ────────────────────────────────────────────────────
  console.log('👤 Seeding platform admin...');
  const adminEmail = 'admin@smartdom.com';
  const [existingAdmin] = await conn.query(`SELECT id FROM platform_admins WHERE email = ?`, [adminEmail]);
  if (existingAdmin.length === 0) {
    const hashedPw = await bcrypt.hash('admin123', 12);
    await conn.query(
      `INSERT INTO platform_admins (email, password, name, role) VALUES (?, ?, ?, ?)`,
      [adminEmail, hashedPw, 'SmartDom Admin', 'super_admin']
    );
    console.log('✅ Platform Admin created: admin@smartdom.com / admin123');
  } else {
    console.log('ℹ️  Platform Admin already exists');
  }

  await conn.end();
  console.log('\n🎉 Platform database setup complete!');
  console.log(`   Database: ${PLATFORM_DB}`);
  console.log(`   Tables: platform_admins, dormitory_registry, packages, subscriptions, platform_accounting`);
}

setupPlatformDb().catch(err => {
  console.error('❌ Platform DB setup failed:', err.message);
  process.exit(1);
});
