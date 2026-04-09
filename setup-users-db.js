const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// SHA-256 helper for Node.js
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function initDb() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Inserting mock users with hashed passwords...');
    
    // Check if admin exists
    const adminExists = await sql`SELECT 1 FROM users WHERE email = 'admin@smartdom.com'`;
    if (adminExists.length === 0) {
      await sql`
        INSERT INTO users (email, password, name, role) 
        VALUES ('admin@smartdom.com', ${hashPassword('admin123')}, 'ผู้ดูแลระบบ (Admin/Owner)', 'admin')
      `;
    }

    // Check if tenant exists
    const tenantExists = await sql`SELECT 1 FROM users WHERE email = 'tenant@smartdom.com'`;
    if (tenantExists.length === 0) {
      await sql`
        INSERT INTO users (email, password, name, role) 
        VALUES ('tenant@smartdom.com', ${hashPassword('tenant123')}, 'สมชาย ผู้เช่า (Tenant)', 'tenant')
      `;
    }

    // Check if keeper exists
    const keeperExists = await sql`SELECT 1 FROM users WHERE email = 'keeper@smartdom.com'`;
    if (keeperExists.length === 0) {
      await sql`
        INSERT INTO users (email, password, name, role) 
        VALUES ('keeper@smartdom.com', ${hashPassword('keeper123')}, 'สมหญิง แม่บ้าน (Keeper)', 'keeper')
      `;
    }

    console.log('Database users setup complete!');
    console.log('-----------------------------------');
    console.log('Mock Accounts explicitly created:');
    console.log('Admin: admin@smartdom.com / admin123');
    console.log('Tenant: tenant@smartdom.com / tenant123');
    console.log('Keeper: keeper@smartdom.com / keeper123');
    console.log('-----------------------------------');

  } catch (err) {
    console.error('Error setting up users database:', err);
  }
}

initDb();
