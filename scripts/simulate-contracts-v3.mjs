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
      SELECT t.*, r.room_number
      FROM tenants t 
      JOIN rooms r ON t.room_id = r.id 
      WHERE r.dorm_id = ${dormId}
      ORDER BY r.room_number ASC
    `;

    console.log(`Found ${tenants.length} tenants for simulation.`);

    // Improved mock signature (squiggle-like)
    const mockSignature = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAxMDAgNDAiPjxwYXRoIGQ9Ik0xMCAzMEMyMCAzMCAyNSAxMCAzNSAxMEM0NSAxMCA1MCAzMCA2MCAzMEM3MCAzMCA4MCAxMCA5MCAxMCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+";

    // Delete existing contracts for this dorm to start fresh
    await sql`
        DELETE FROM contracts 
        WHERE room_id IN (SELECT id FROM rooms WHERE dorm_id = ${dormId})
    `;

    for (let i = 0; i < tenants.length; i++) {
        const tenant = tenants[i];
        
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
                ${tenant.id}, 
                '2026-04-16', 
                '2027-04-16', 
                9000, 
                ${status}, 
                ${signedAt}, 
                ${tenantSignature}, 
                ${ownerSignature}
            )
        `;
        console.log(`Simulated contract for ${tenant.name} room ${tenant.room_number} - Status: ${status}`);
    }

    console.log('Contract simulation with squiggly signatures completed.');

  } catch (err) {
    console.error('Contract simulation failed:', err);
  }
}

main();
