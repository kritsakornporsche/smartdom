const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'rooms'`;
    console.log('Room Columns (featureroom):', cols.map(c => `${c.column_name} (${c.data_type})`));
  } catch (e) {
    console.error(e);
  }
}
check();
