const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    console.log('Adding signature_data column to contracts table...');
    await sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signature_data TEXT`;
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
