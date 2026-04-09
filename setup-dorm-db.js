const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// SHA-256 helper for Node.js
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function setupDorm() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('--- Setting up Dormitory Data ---');

    // 1. Ensure users table is updated and hash passwords for mock accounts
    console.log('Updating mock accounts with SHA-256 passwords...');
    const mockUsers = [
      { email: 'admin@smartdom.com', password: 'admin123', name: 'แอดมิน (Admin/Owner)', role: 'admin' },
      { email: 'tenant@smartdom.com', password: 'tenant123', name: 'สมชาย (Tenant)', role: 'tenant' },
      { email: 'keeper@smartdom.com', password: 'keeper123', name: 'สมหญิง (Keeper)', role: 'keeper' }
    ];

    for (const u of mockUsers) {
      const hashed = hashPassword(u.password);
      const exists = await sql`SELECT id FROM users WHERE email = ${u.email}`;
      if (exists.length === 0) {
        await sql`INSERT INTO users (email, password, name, role) VALUES (${u.email}, ${hashed}, ${u.name}, ${u.role})`;
      } else {
        // Update password to hashed version if it was plain text before
        await sql`UPDATE users SET password = ${hashed} WHERE email = ${u.email}`;
      }
    }

    // 2. Create Dormitory Table
    console.log('Creating dormitory_profile table...');
    await sql`
      CREATE TABLE IF NOT EXISTS dormitory_profile (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        tax_id VARCHAR(50),
        owner_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. Insert SmartDom Profile
    const admin = await sql`SELECT id FROM users WHERE email = 'admin@smartdom.com' LIMIT 1`;
    const adminId = admin[0].id;

    const dormExists = await sql`SELECT 1 FROM dormitory_profile WHERE owner_id = ${adminId}`;
    if (dormExists.length === 0) {
      console.log('Inserting default dormitory profile...');
      await sql`
        INSERT INTO dormitory_profile (name, address, phone, tax_id, owner_id)
        VALUES (
          'SmartDom คอนโดมิเนียม',
          '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
          '02-123-4567',
          '0105560000123',
          ${adminId}
        )
      `;
    }

    console.log('Dormitory setup complete!');
    console.log('Dormitory Name: SmartDom คอนโดมิเนียม');
    console.log('Owner Account: admin@smartdom.com (admin123)');

  } catch (err) {
    console.error('Error in setup-dorm-db:', err);
  }
}

setupDorm();
