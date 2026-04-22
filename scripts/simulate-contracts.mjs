import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const dormId = 6;

  try {
    const tenants = await sql`
      SELECT t.* 
      FROM tenants t 
      JOIN rooms r ON t.room_id = r.id 
      WHERE r.dorm_id = ${dormId}
    `;

    console.log(`Found ${tenants.length} tenants for simulation.`);

    const mockSignature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    for (let i = 0; i < tenants.length; i++) {
        const tenant = tenants[i];
        
        await sql`DELETE FROM contracts WHERE tenant_id = ${tenant.user_id}`;

        let status = 'Active';
        let signedAt = new Date().toISOString();
        let ownerSignature = mockSignature;
        let tenantSignature = mockSignature;

        if (i >= 7) {
            status = 'PendingOwnerSignature';
            ownerSignature = null;
            signedAt = null;
        }

        await sql`
            INSERT INTO contracts (
                room_id, 
                tenant_id, 
                start_date, 
                end_date, 
                deposit_amount, 
                status, 
                signed_at, 
                signature_data, 
                owner_signature_data
            )
            VALUES (
                ${tenant.room_id}, 
                ${tenant.user_id}, 
                '2026-04-01', 
                '2027-04-01', 
                10000, 
                ${status}, 
                ${signedAt}, 
                ${tenantSignature}, 
                ${ownerSignature}
            )
        `;
        console.log(`Simulated contract for ${tenant.name} - Status: ${status}`);
    }

    console.log('Contract simulation completed successfully.');

  } catch (err) {
    console.error('Contract simulation failed:', err);
  }
}

main();
