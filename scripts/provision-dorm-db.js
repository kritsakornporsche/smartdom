/**
 * scripts/provision-dorm-db.js
 * Creates a new per-dormitory database with all required tables.
 * Called automatically during onboarding when owner registers their dorm.
 *
 * Usage: node scripts/provision-dorm-db.js <db_name>
 * Example: node scripts/provision-dorm-db.js smartdom_dorm_3
 */
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const MYSQL_BASE = 'mysql://root:@localhost:3306';

async function provisionDormDb(dbName) {
  if (!dbName || !dbName.startsWith('smartdom_dorm_')) {
    throw new Error('DB name must start with "smartdom_dorm_"');
  }

  console.log(`🏗️  Provisioning dormitory database: ${dbName}`);

  // Create the database
  const initConn = await mysql.createConnection(`${MYSQL_BASE}/`);
  await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await initConn.end();

  // Connect to it and create tables
  const conn = await mysql.createConnection(`${MYSQL_BASE}/${dbName}`);
  await conn.query(`SET SESSION sql_mode='ANSI_QUOTES,STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'`);
  await conn.query(`SET FOREIGN_KEY_CHECKS = 0`);

  console.log('  Creating tables...');

  // ── Users (owner, tenants, keepers of this dorm) ───────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      email      VARCHAR(255) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      name       VARCHAR(255) NOT NULL,
      role       ENUM('owner','tenant','keeper','guest') NOT NULL DEFAULT 'guest',
      sub_role   VARCHAR(50) NULL,
      phone      VARCHAR(50) NULL,
      image_url  LONGTEXT NULL,
      bio        TEXT NULL,
      is_active  BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Dormitory Profile (1 record per DB) ────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS dormitory_profile (
      id                INT AUTO_INCREMENT PRIMARY KEY,
      name              VARCHAR(255) NOT NULL,
      address           TEXT,
      phone             VARCHAR(50),
      tax_id            VARCHAR(50),
      owner_id          INT REFERENCES users(id),
      water_rate        DECIMAL(10,2) DEFAULT 18.00,
      electricity_rate  DECIMAL(10,2) DEFAULT 8.00,
      has_wifi          BOOLEAN DEFAULT FALSE,
      has_parking       BOOLEAN DEFAULT FALSE,
      pet_friendly      BOOLEAN DEFAULT FALSE,
      has_lan           BOOLEAN DEFAULT FALSE,
      facilities        TEXT,
      map_url           LONGTEXT,
      description       TEXT NULL,
      has_air_con       BOOLEAN DEFAULT FALSE,
      cover_image       LONGTEXT NULL,
      created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Rooms ──────────────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      room_number VARCHAR(50) NOT NULL,
      room_type   VARCHAR(50) DEFAULT 'Standard',
      price       DECIMAL(10,2) NOT NULL,
      status      ENUM('Available','Occupied','Maintenance') DEFAULT 'Available',
      floor       INT DEFAULT 1,
      tenant_id   INT NULL,
      image_url   LONGTEXT NULL,
      images      LONGTEXT NULL,
      amenities   LONGTEXT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Tenants ────────────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      email      VARCHAR(255) UNIQUE NULL,
      phone      VARCHAR(50) NULL,
      room_id    INT NULL,
      user_id    INT UNIQUE NULL,
      status     ENUM('Active','Inactive','MoveOut') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // ── Contracts ─────────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS contracts (
      id                   INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id            INT NULL,
      room_id              INT NULL,
      start_date           TIMESTAMP NULL,
      end_date             TIMESTAMP NULL,
      deposit_amount       DECIMAL(10,2) DEFAULT 0,
      status               VARCHAR(50) DEFAULT 'PendingTenantSignature',
      signature_data       LONGTEXT NULL,
      owner_signature_data LONGTEXT NULL,
      signed_at            TIMESTAMP NULL,
      contract_terms       TEXT NULL,
      created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
    )
  `);

  // ── Bills ──────────────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS bills (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id     INT NULL,
      title         VARCHAR(255) NOT NULL,
      amount        DECIMAL(10,2) NOT NULL,
      billing_cycle VARCHAR(100) NULL,
      due_date      DATE NULL,
      status        ENUM('Unpaid','Paid','Overdue','Cancelled') DEFAULT 'Unpaid',
      slip_url      LONGTEXT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
    )
  `);

  // ── Maintenance Requests (from tenants) ────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id   INT NULL,
      room_number VARCHAR(50),
      issue_type  VARCHAR(100),
      description TEXT NOT NULL,
      status      ENUM('Pending','InProgress','Completed','Cancelled') DEFAULT 'Pending',
      image_url   LONGTEXT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
    )
  `);

  // ── Maintenance Jobs (assigned to keepers) ─────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS maintenance_jobs (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      room_id      INT NULL,
      issue        TEXT NOT NULL,
      urgency      ENUM('normal','rush') DEFAULT 'normal',
      status       ENUM('pending','in_progress','waiting_parts','completed','cancelled') DEFAULT 'pending',
      assigned_to  INT NULL,
      notes        TEXT NULL,
      photo_url    LONGTEXT NULL,
      tenant_notes TEXT NULL,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // ── Cleaning Jobs ──────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS cleaning_jobs (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      room_id      INT NULL,
      task         VARCHAR(255) NOT NULL,
      status       ENUM('pending','in_progress','completed') DEFAULT 'pending',
      assigned_to  INT NULL,
      notes        TEXT NULL,
      photo_url    LONGTEXT NULL,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
    )
  `);

  // ── Announcements ──────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      title        VARCHAR(255) NOT NULL,
      content      TEXT NOT NULL,
      is_important BOOLEAN DEFAULT FALSE,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Announcement Reads ─────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS announcement_reads (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      announcement_id  INT NOT NULL,
      user_id          INT NOT NULL,
      read_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_read (announcement_id, user_id),
      FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
    )
  `);

  // ── Conversations (Chat) ───────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      guest_id     INT NULL,
      owner_id     INT NULL,
      last_message TEXT NULL,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // ── Chat Messages ──────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      conversation_id INT NOT NULL,
      sender_id       INT NOT NULL,
      message         TEXT NOT NULL,
      is_read         BOOLEAN DEFAULT FALSE,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `);

  // ── Keepers (staff) ────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS keepers (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      email      VARCHAR(255) NULL,
      phone      VARCHAR(50) NULL,
      position   ENUM('Maid','Technician','Guard','Other') DEFAULT 'Maid',
      user_id    INT UNIQUE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // ── Booking Progress ───────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS booking_progress (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      guest_id   INT NULL,
      room_id    INT NULL,
      status     VARCHAR(50) DEFAULT 'Pending',
      notes      TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
    )
  `);

  // ── Move Out Requests ──────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS move_out_requests (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      tenant_id    INT NULL,
      room_id      INT NULL,
      move_out_date DATE NULL,
      reason       TEXT NULL,
      status       ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
    )
  `);

  // ── Parcels ────────────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS parcels (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      room_number     VARCHAR(50),
      recipient_name  VARCHAR(255),
      tracking_number VARCHAR(100),
      carrier         VARCHAR(100),
      status          ENUM('Pending','Picked Up') DEFAULT 'Pending',
      image_url       LONGTEXT NULL,
      received_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      picked_up_at    TIMESTAMP NULL,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Vehicles ───────────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      room_number   VARCHAR(50),
      owner_name    VARCHAR(255),
      license_plate VARCHAR(50),
      province      VARCHAR(100),
      vehicle_type  ENUM('Car','Motorcycle','Bicycle','Other') DEFAULT 'Car',
      brand_model   VARCHAR(100),
      color         VARCHAR(50),
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Dormitory Rules ────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS dormitory_rules (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      content     TEXT NOT NULL,
      order_index INT DEFAULT 0,
      is_active   BOOLEAN DEFAULT TRUE,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Accounting Transactions ────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS accounting_transactions (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      type             ENUM('Income','Expense') NOT NULL,
      category         VARCHAR(100) NOT NULL,
      amount           DECIMAL(10,2) NOT NULL,
      description      TEXT,
      reference_id     INT NULL,
      reference_type   VARCHAR(50) NULL,
      transaction_date DATE NOT NULL,
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Monthly Accounting Summary ─────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS accounting_monthly_summary (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      year          INT NOT NULL,
      month         INT NOT NULL,
      total_income  DECIMAL(10,2) DEFAULT 0,
      total_expense DECIMAL(10,2) DEFAULT 0,
      net_profit    DECIMAL(10,2) DEFAULT 0,
      updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE (year, month)
    )
  `);

  await conn.query(`SET FOREIGN_KEY_CHECKS = 1`);
  await conn.end();

  console.log(`✅ Dormitory database "${dbName}" provisioned successfully!`);
  return dbName;
}

// Run directly if called from command line
if (require.main === module) {
  const dbName = process.argv[2];
  if (!dbName) {
    console.error('Usage: node scripts/provision-dorm-db.js <db_name>');
    console.error('Example: node scripts/provision-dorm-db.js smartdom_dorm_3');
    process.exit(1);
  }
  provisionDormDb(dbName).catch(err => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { provisionDormDb };
