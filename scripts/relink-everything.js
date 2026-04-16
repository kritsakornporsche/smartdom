const { neon } = require('@neondatabase/serverless');
const sql = neon("postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require");

async function fix() {
  try {
    // 1. Link testowner@test.com (ID 18) to Dorm 4 (tesdom)
    await sql`UPDATE dormitory_profile SET owner_id = 18 WHERE id = 4`;
    console.log('Linked User 18 to Dorm 4');

    // 2. Ensure all orphan rooms (dorm_id IS NULL) are linked to Dorm 4
    await sql`UPDATE rooms SET dorm_id = 4 WHERE dorm_id IS NULL`;
    console.log('Linked all orphan rooms to Dorm 4');

  } catch (err) {
    console.error(err);
  }
}

fix();
