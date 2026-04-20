const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const tableCols = await sql`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('bills', 'users')`;
    console.log(tableCols);
  } catch (e) {
    console.error(e);
  }
}
check();
