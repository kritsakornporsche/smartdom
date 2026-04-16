const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    await sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS owner_signature_data TEXT`;
    console.log('Successfully added owner_signature_data column to contracts table.');
  } catch (err) {
    console.error(err);
  }
}
run();
