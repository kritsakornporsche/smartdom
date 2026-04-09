const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

async function seedSmartDom() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    // 1. Clear Existing Data
    console.log('--- Clearing existing database ---');
    await sql`DROP TABLE IF EXISTS tenants CASCADE`;
    await sql`DROP TABLE IF EXISTS rooms CASCADE`;
    await sql`DROP TABLE IF EXISTS dormitory_profile CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;

    // 2. Ensure Table Structure
    console.log('--- Ensuring table structures ---');
    
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'guest',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sub_role VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Dormitory Profile table
    await sql`
      CREATE TABLE IF NOT EXISTS dormitory_profile (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        tax_id VARCHAR(50),
        owner_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Rooms table (adding dorm_id)
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_number VARCHAR(50) UNIQUE NOT NULL,
        room_type VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Available',
        floor INTEGER DEFAULT 1,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add dorm_id to rooms if not exists
    await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS dorm_id INTEGER REFERENCES dormitory_profile(id)`;

    // Tenants table
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        room_id INTEGER REFERENCES rooms(id),
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Migration: Add user_id to tenants if not exists
    await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS user_id INTEGER UNIQUE REFERENCES users(id)`;


    // 2. Seed Owner
    console.log('--- Seeding Owner ---');
    const adminEmail = 'owner@smartdom.com';
    const hashedAdminPass = hashPassword('owner123');
    let admin = await sql`SELECT id FROM users WHERE email = ${adminEmail} LIMIT 1`;
    
    if (admin.length === 0) {
      admin = await sql`
        INSERT INTO users (email, password, name, role) 
        VALUES (${adminEmail}, ${hashedAdminPass}, 'คุณกฤษฎา (เจ้าของหอพัก)', 'owner')
        RETURNING id
      `;
    }
    const adminId = admin[0].id;

    // 3. Seed Dormitory Profile
    console.log('--- Seeding Dormitory Profile ---');
    let dorm = await sql`SELECT id FROM dormitory_profile WHERE owner_id = ${adminId} LIMIT 1`;
    
    if (dorm.length === 0) {
      dorm = await sql`
        INSERT INTO dormitory_profile (name, address, phone, tax_id, owner_id)
        VALUES (
          'SmartDom Grand Residence',
          '99/1 ซอยอารีย์ ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400',
          '02-123-4567',
          '0123456789012',
          ${adminId}
        )
        RETURNING id
      `;
    }
    const dormId = dorm[0].id;

    // 4. Seed Rooms
    console.log('--- Seeding Rooms (10 rooms) ---');
    const roomTypes = ['Standard', 'Deluxe', 'Suite'];
    const prices = { 'Standard': 4500, 'Deluxe': 6500, 'Suite': 9500 };
    
    for (let f = 1; f <= 2; f++) {
      for (let r = 1; r <= 5; r++) {
        const roomNum = `${f}0${r}`;
        const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
        const price = prices[roomType];
        
        await sql`
          INSERT INTO rooms (room_number, room_type, price, floor, dorm_id, status)
          VALUES (${roomNum}, ${roomType}, ${price}, ${f}, ${dormId}, 'Available')
          ON CONFLICT (room_number) DO UPDATE SET dorm_id = ${dormId}
        `;
      }
    }

    // 5. Seed Tenants (linked to existing users or creating new ones)
    console.log('--- Seeding Tenants (3 tenants) ---');
    const tenantMocks = [
      { email: 'somchai@test.com', name: 'สมชาย ใจดี', phone: '081-111-2222', roomNum: '101' },
      { email: 'somying@test.com', name: 'สมหญิง รักสะอาด', phone: '086-333-4444', roomNum: '102' },
      { email: 'manee@test.com', name: 'มานี มานะ', phone: '089-555-6666', roomNum: '201' }
    ];

    for (const t of tenantMocks) {
      // Create user account for tenant if not exists
      let tUser = await sql`SELECT id FROM users WHERE email = ${t.email} LIMIT 1`;
      if (tUser.length === 0) {
        tUser = await sql`
          INSERT INTO users (email, password, name, role)
          VALUES (${t.email}, ${hashPassword('password123')}, ${t.name}, 'tenant')
          RETURNING id
        `;
      }
      const tUserId = tUser[0].id;

      // Get room id
      const room = await sql`SELECT id FROM rooms WHERE room_number = ${t.roomNum} LIMIT 1`;
      const roomId = room[0].id;

      // Insert/Update tenant record
      await sql`
        INSERT INTO tenants (user_id, name, email, phone, room_id, status)
        VALUES (${tUserId}, ${t.name}, ${t.email}, ${t.phone}, ${roomId}, 'Active')
        ON CONFLICT (user_id) DO UPDATE SET room_id = ${roomId}, email = ${t.email}
      `;


      // Mark room as Occupied
      await sql`UPDATE rooms SET status = 'Occupied' WHERE id = ${roomId}`;
    }

    console.log('✅ Full Database Seeding Complete!');
    console.log('Summary:');
    console.log('- Dormitory: SmartDom Grand Residence (Owner: owner@smartdom.com)');
    console.log('- Rooms: 10 rooms created (101-105, 201-205)');
    console.log('- Tenants: 3 tenants moved in (101, 102, 201)');

  } catch (err) {
    console.error('❌ Error Seeding Database:', err);
  }
}

seedSmartDom();
