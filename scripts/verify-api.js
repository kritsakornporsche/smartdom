const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function verifyApiLogic() {
  try {
    const ownerEmail = 'testowner@test.test';

    // 1. Get owner's dorm
    const dorms = await sql`SELECT id FROM dormitory_profile WHERE owner_id = (SELECT id FROM users WHERE email = ${ownerEmail})`;
    console.log('OWNER DORMS:', JSON.stringify(dorms));

    if (dorms.length > 0) {
      const dormId = dorms[0].id;
      // 2. Fetch rooms
      const rooms = await sql`
        SELECT r.id, r.room_number, r.room_type, r.price, r.status, r.floor, r.image_url, r.images, r.amenities, r.created_at, r.tenant_id, u.name as tenant_name
        FROM rooms r
        LEFT JOIN users u ON r.tenant_id = u.id
        WHERE r.dorm_id = ${dormId}
        ORDER BY r.room_number ASC
      `;
      console.log('ROOMS COUNT:', rooms.length);
      if (rooms.length > 0) {
        console.log('SAMPLE ROOM:', JSON.stringify(rooms[0]));
      }
    }
  } catch (err) {
    console.error('API SIMULATION ERROR:', err);
  }
}

verifyApiLogic();
