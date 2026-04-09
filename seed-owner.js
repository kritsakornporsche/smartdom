const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createOwner() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const email = 'owner@smartdom.com';
    const pass = hashPassword('owner123');
    const name = 'คุณเจ้าของ (Dorm Owner)';
    
    console.log('Creating owner account...');
    await sql`
      INSERT INTO users (email, password, name, role)
      VALUES (${email}, ${pass}, ${name}, 'owner')
      ON CONFLICT (email) DO UPDATE SET role = 'owner'
    `;

    // Ensure dormitory profile is linked to this owner
    const owner = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    const ownerId = owner[0].id;
    
    await sql`
      UPDATE dormitory_profile 
      SET owner_id = ${ownerId} 
      WHERE name = 'SmartDom Mansion'
    `;

    console.log('Owner account created: owner@smartdom.com / owner123');
    console.log('Role: owner');
  } catch (err) {
    console.error(err);
  }
}

createOwner();
