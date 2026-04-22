const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

async function check() {
  try {
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'rooms'
    `;
    console.log('ROOMS COLUMNS:');
    cols.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));
  } catch (err) {
    console.error(err);
  }
}

check();
