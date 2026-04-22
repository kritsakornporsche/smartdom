const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function setup() {
  try {
    // 1. Get otest user
    const users = await sql`SELECT id FROM users WHERE email = 'otest@test.test'`;
    if (users.length === 0) {
      console.log('User otest@test.test not found');
      return;
    }
    const userId = users[0].id;

    // 2. Create Dormitory for otest
    const dormResult = await sql`
      INSERT INTO dormitory_profile (name, address, phone, owner_id)
      VALUES ('OTest Mansion', '123 Test Street', '0812345678', ${userId})
      RETURNING id
    `;
    const dormId = dormResult[0].id;
    console.log(`Created dorm ${dormId} for otest`);

    // 3. Create Subscription for otest
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    await sql`
      INSERT INTO subscriptions (owner_id, package_id, status, end_date)
      VALUES (${userId}, 2, 'Active', ${endDate.toISOString()})
    `;
    console.log('Created subscription for otest');

    // 4. Create 10 rooms for otest
    for (let i = 1; i <= 10; i++) {
      const roomNum = `O-${100 + i}`;
      await sql`
        INSERT INTO rooms (dorm_id, room_number, room_type, price, floor, status)
        VALUES (${dormId}, ${roomNum}, 'Standard', 5000, 1, 'Available')
      `;
    }
    console.log('Created 10 rooms for otest');

  } catch (err) {
    console.error('Error:', err);
  }
}

setup();
