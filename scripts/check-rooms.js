const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const roomsCount = await sql`SELECT count(*) FROM rooms`;
    console.log('Total Rooms:', roomsCount[0].count);

    const rooms = await sql`SELECT r.*, d.name as dorm_name FROM rooms r LEFT JOIN dormitory_profile d ON r.dorm_id = d.id LIMIT 5`;
    console.log('Sample Rooms:', JSON.stringify(rooms, null, 2));

    const dorms = await sql`SELECT * FROM dormitory_profile`;
    console.log('Dormitories:', JSON.stringify(dorms, null, 2));

    const owners = await sql`SELECT id, email, role FROM users WHERE role = 'owner'`;
    console.log('Owners:', JSON.stringify(owners, null, 2));

    const roomSchema = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'rooms'
    `;
    console.log('Rooms Schema:', JSON.stringify(roomSchema, null, 2));

  } catch (err) {
    console.error(err);
  }
}

check();
