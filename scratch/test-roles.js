const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const users = await sql`SELECT email, role FROM users`;
    console.table(users);
  } catch (e) { console.error(e); }
}
run();
