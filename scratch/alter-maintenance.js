const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    // Add image_url column
    await sql`ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS image_url TEXT`;
    console.log('Successfully added image_url column to maintenance_requests');
  } catch (e) {
    console.error(e);
  }
}
run();
