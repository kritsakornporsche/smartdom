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
    const rooms = await sql`SELECT * FROM rooms WHERE dorm_id = 4`;
    console.log('Rooms for Dorm 4:', JSON.stringify(rooms, null, 2));

    const owners = await sql`SELECT id, name, email FROM users WHERE role = 'Owner'`;
    console.log('Owners:', JSON.stringify(owners, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
