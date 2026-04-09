const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function initDb() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('Creating tenants table...');
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        room_id INTEGER REFERENCES rooms(id),
        phone VARCHAR(20),
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating announcements table...');
    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_important BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating bills table...');
    await sql`
      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id),
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        billing_cycle VARCHAR(50),
        due_date DATE,
        status VARCHAR(50) DEFAULT 'Unpaid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating maintenance table...');
    await sql`
      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id),
        room_number VARCHAR(50),
        issue_type VARCHAR(100),
        description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating contracts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id),
        room_id INTEGER REFERENCES rooms(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        deposit_amount DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating move_out_requests table...');
    await sql`
      CREATE TABLE IF NOT EXISTS move_out_requests (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id),
        desired_date DATE NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Inserting mock tenant data...');
    // Seed some mock data for UI testing if tables are empty
    await sql`
      INSERT INTO tenants (name, email, phone) 
      SELECT 'สมชาย ใจดี', 'somchai@example.com', '0812345678'
      WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE email = 'somchai@example.com')
    `;

    console.log('Inserting mock announcements...');
    await sql`
      INSERT INTO announcements (title, content, is_important)
      SELECT 'แจ้งล้างแอร์ประจำปี', 'ทางหอพักจะทำการล้างแอร์ในวันเสาร์ที่ 15 นี้ ขอความร่วมมือผู้เช่าเก็บของใช้ออกจากบริเวณแอร์ด้วยครับ', true
      WHERE NOT EXISTS (SELECT 1 FROM announcements)
    `;

    console.log('Inserting mock bill...');
    await sql`
      INSERT INTO bills (tenant_id, title, amount, billing_cycle, due_date, status)
      SELECT 1, 'ค่าเช่าและค่าน้ำไฟ ประจำเดือน ตุลาคม', 5250.00, 'ตุลาคม 2026', '2026-10-05', 'Unpaid'
      WHERE NOT EXISTS (SELECT 1 FROM bills)
    `;

    console.log('Database setup complete!');

  } catch (err) {
    console.error('Error setting up database:', err);
  }
}

initDb();
