const { neon } = require('@neondatabase/serverless');
const sql = neon("postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require");

async function check() {
  try {
    const profile = await sql`
      SELECT d.id, d.name, u.email 
      FROM dormitory_profile d 
      JOIN users u ON d.owner_id = u.id
    `;
    console.log('PROFILES:', JSON.stringify(profile));
  } catch (err) {
    console.error(err);
  }
}

check();
