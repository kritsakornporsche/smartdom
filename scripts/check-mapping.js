const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkMapping() {
  console.log('--- USER - DORM MAPPING ---');
  const mapping = await sql`
    SELECT u.id as user_id, u.email, u.role, d.id as dorm_id, d.name as dorm_name
    FROM users u
    LEFT JOIN dormitory_profile d ON u.id = d.owner_id
    WHERE u.role IN ('owner', 'admin')
  `;
  console.table(mapping);

  console.log('\n--- ROOM COUNTS BY DORM ---');
  const counts = await sql`
    SELECT dorm_id, COUNT(*) as count
    FROM rooms
    GROUP BY dorm_id
    ORDER BY dorm_id
  `;
  console.table(counts);

  console.log('\n--- FIRST 5 ROOMS ---');
  const rooms = await sql`SELECT id, room_number, dorm_id, status FROM rooms LIMIT 5`;
  console.table(rooms);
}

checkMapping();
