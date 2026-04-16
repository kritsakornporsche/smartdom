const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const columns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'announcements'`;
    console.table(columns);
  } catch (e) {
    console.error(e);
  }
}
run();
