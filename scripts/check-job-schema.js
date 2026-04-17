const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const cleaningCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cleaning_jobs'`;
    console.log('Cleaning Columns:', cleaningCols.map(c => `${c.column_name} (${c.data_type})`));
    
    const maintenanceCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'maintenance_jobs'`;
    console.log('Maintenance Columns:', maintenanceCols.map(c => `${c.column_name} (${c.data_type})`));
  } catch (e) {
    console.error(e);
  }
}
check();
