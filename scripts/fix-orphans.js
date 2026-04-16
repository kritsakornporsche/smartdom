const { neon } = require('@neondatabase/serverless');
const sql = neon("postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require");

async function fix() {
  try {
    const res = await sql`UPDATE rooms SET dorm_id = 4 WHERE dorm_id IS NULL`;
    console.log('Affected rows:', res.length);
  } catch (err) {
    console.error(err);
  }
}

fix();
