const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function debug() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const users = await sql`SELECT id, email, role FROM users`;
    const dorms = await sql`SELECT id, name, owner_id FROM dormitory_profile`;
    const roomsCount = await sql`SELECT dorm_id, count(*) FROM rooms GROUP BY dorm_id`;
    const subscriptions = await sql`SELECT * FROM subscriptions`;
    const packages = await sql`SELECT * FROM dormitory_packages`;
    
    console.log('--- USERS ---');
    console.table(users);
    
    console.log('--- DORMITORIES ---');
    console.table(dorms);
    
    console.log('--- ROOMS COUNT BY DORM ---');
    console.table(roomsCount);

    console.log('--- SUBSCRIPTIONS ---');
    console.table(subscriptions);

    console.log('--- PACKAGES ---');
    console.table(packages);

  } catch (err) {
    console.error(err);
  }
}

debug();
