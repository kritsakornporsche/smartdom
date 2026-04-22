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
    const res = await sql`
      SELECT r.dorm_id, d.name 
      FROM contracts c 
      JOIN rooms r ON c.room_id = r.id 
      JOIN dormitory_profile d ON r.dorm_id = d.id 
      WHERE c.id IN (14, 15)
    `;
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
