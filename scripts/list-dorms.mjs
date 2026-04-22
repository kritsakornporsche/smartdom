import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const dorms = await sql`SELECT id, name, owner_id FROM dormitory_profile`;
    console.log('Dorms:', JSON.stringify(dorms, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
