import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    await sql`ALTER TABLE dormitory_profile ADD COLUMN IF NOT EXISTS has_lan BOOLEAN DEFAULT FALSE;`;
    console.log('Added has_lan to dormitory_profile');
  } catch(e) {
    console.error(e);
  }
}

main();
