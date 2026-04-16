const { neon } = require('@neondatabase/serverless');
const sql = neon("postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require");

async function check() {
  try {
    const rows = await sql`SELECT id, room_number, dorm_id FROM rooms`;
    console.log('ROOMS:', JSON.stringify(rows));
    
    const dorms = await sql`SELECT id, name FROM dormitory_profile`;
    console.log('DORMS:', JSON.stringify(dorms));
  } catch (err) {
    console.error(err);
  }
}

check();
