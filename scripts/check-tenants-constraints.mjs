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
    const constraints = await sql`SELECT conname, contype FROM pg_constraint WHERE conrelid = 'tenants'::regclass`;
    console.log(JSON.stringify(constraints, null, 2));
    
    const indexes = await sql`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'tenants'`;
    console.log(JSON.stringify(indexes, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
