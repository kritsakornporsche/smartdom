import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in .env.local');
    return;
  }
  const sql = neon(process.env.DATABASE_URL);
  try {
    const res = await sql`SELECT * FROM dormitory_packages`;
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
