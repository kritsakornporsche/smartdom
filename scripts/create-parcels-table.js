const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  console.log('Creating parcels table...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS parcels (
        id SERIAL PRIMARY KEY,
        dorm_id INTEGER NOT NULL,
        room_number TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        tracking_number TEXT,
        carrier TEXT,
        status TEXT DEFAULT 'Received',
        received_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        picked_up_at TIMESTAMP,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Parcels table created successfully');
  } catch (e) {
    console.error('Error creating parcels table:', e);
  }
}
run();
