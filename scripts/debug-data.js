const { neon } = require('@neondatabase/serverless');
const DATABASE_URL = "postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

async function debug() {
  try {
    // 1. Check current dorm info
    const dorms = await sql`SELECT d.id, d.name, u.email as owner_email FROM dormitory_profile d JOIN users u ON d.owner_id = u.id`;
    console.log('DORM OWNER INFO:', JSON.stringify(dorms));

    // 2. Check room count grouped by dorm
    const counts = await sql`SELECT dorm_id, count(*) FROM rooms GROUP BY dorm_id`;
    console.log('ROOM COUNTS:', JSON.stringify(counts));

    // 3. List tables
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('TABLES:', JSON.stringify(tables));
  } catch (err) {
    console.error(err);
  }
}

debug();
