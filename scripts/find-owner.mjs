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
    const contracts = await sql`
        SELECT c.id, t.name as tenant_name, d.name as dorm_name, d.owner_id, u.email as owner_email
        FROM contracts c
        JOIN tenants t ON c.tenant_id = t.user_id
        JOIN rooms r ON c.room_id = r.id
        JOIN dormitory_profile d ON r.dorm_id = d.id
        JOIN users u ON d.owner_id = u.id
        WHERE t.name = 'แขก'
    `;
    console.log(JSON.stringify(contracts, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
