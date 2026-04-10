
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  const users = await sql`SELECT email, name, role FROM users WHERE email LIKE '%guest%' OR email LIKE '%tenant%' OR name LIKE '%guest%'`;
  console.log(JSON.stringify(users, null, 2));
}

check();
