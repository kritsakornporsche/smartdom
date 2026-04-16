const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const res = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.table(res);
  } catch (e) { console.error(e); }
}
run();
