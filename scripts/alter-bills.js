const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    await sql`ALTER TABLE bills ADD COLUMN IF NOT EXISTS slip_url TEXT;`;
    console.log('Successfully added slip_url to bills table');
  } catch(e) {
    console.error(e);
  }
}
run();
