const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function addDemoKeeper() {
  const sql = neon(process.env.DATABASE_URL);
  const email = 'keeper@smartdom.com';
  const password = 'keeper123';

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO users (email, password, name, role)
        VALUES (${email}, ${hashPassword(password)}, 'เจ้าหน้าที่ (Demo Keeper)', 'keeper')
      `;
      console.log('✅ Demo keeper account created: keeper@smartdom.com / keeper123');
    } else {
      console.log('ℹ️ Demo keeper account already exists.');
    }
  } catch (err) {
    console.error('❌ Error adding demo keeper:', err);
  }
}

addDemoKeeper();
