const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    console.log('Altering rooms table...');
    await sql`
      ALTER TABLE rooms 
      ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}'
    `;
    console.log('Table altered successfully.');
  } catch (e) {
    console.error('Migration failed:', e);
  }
}
migrate();
