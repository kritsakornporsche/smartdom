const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function setup() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('Creating booking_progress table...');
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS booking_progress (
        id SERIAL PRIMARY KEY,
        user_email TEXT NOT NULL,
        room_id INTEGER NOT NULL,
        current_step INTEGER DEFAULT 1,
        booking_data JSONB DEFAULT '{}',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_email, room_id)
      );
    `;
    
    console.log('✅ booking_progress table created successfully.');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  }
}

setup();
