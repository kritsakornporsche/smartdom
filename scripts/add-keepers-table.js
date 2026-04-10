const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function createKeepersTable() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🚀 Creating Keepers Table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS keepers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        position VARCHAR(50) NOT NULL,
        dorm_id INTEGER REFERENCES dormitory_profile(id),
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ Keepers table ensured.');
  } catch (err) {
    console.error('❌ Error creating keepers table:', err);
  }
}

createKeepersTable();
