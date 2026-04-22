const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const DATABASE_URL = "postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

async function createAdmin() {
  const email = 'admin@smartdom.com';
  const plainPassword = 'Admin1234!';
  const name = 'Admin SmartDom';
  const role = 'admin';

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // Check if user already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      console.log(`User ${email} already exists. Updating role to admin...`);
      await sql`UPDATE users SET role = ${role}, password = ${hashedPassword}, name = ${name}, is_active = TRUE WHERE email = ${email}`;
    } else {
      console.log(`Creating new admin user: ${email}`);
      await sql`
        INSERT INTO users (name, email, password, role, is_active)
        VALUES (${name}, ${email}, ${hashedPassword}, ${role}, TRUE)
      `;
    }
    
    console.log('-----------------------------------');
    console.log('Admin account ready:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${plainPassword}`);
    console.log('-----------------------------------');
  } catch (err) {
    console.error('Error creating admin:', err);
  }
}

createAdmin();
