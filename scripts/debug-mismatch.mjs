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
    // Check mismatch
    const mismatch = await sql`
        SELECT c.id, c.tenant_id as contract_tenant_id, t.id as tenant_id, t.user_id
        FROM contracts c
        LEFT JOIN tenants t ON c.tenant_id = t.id
        LIMIT 10
    `;
    console.log('Mismatch check:', JSON.stringify(mismatch, null, 2));

    const mismatch2 = await sql`
        SELECT c.id, c.tenant_id as contract_tenant_id, t.id as tenant_id, t.user_id
        FROM contracts c
        LEFT JOIN tenants t ON c.tenant_id = t.user_id
        LIMIT 10
    `;
    console.log('Mismatch check (user_id):', JSON.stringify(mismatch2, null, 2));

  } catch (err) {
    console.error(err);
  }
}

main();
