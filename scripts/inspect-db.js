const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log('Tables:', tables.map(t => t.table_name));
  
  for (const table of tables.map(t => t.table_name)) {
    const columns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ${table}`;
    console.log(`Table ${table} columns:`, columns.map(c => `${c.column_name} (${c.data_type})`));
  }
}

check();
