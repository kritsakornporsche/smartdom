import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const dormId = 6;
  const ownerId = 22;

  try {
    // Check conversation columns
    const convCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'conversations'`;
    console.log('Conversation Columns:', convCols.map(c => c.column_name).join(', '));

    const rooms = await sql`SELECT * FROM rooms WHERE dorm_id = ${dormId} ORDER BY room_number ASC`;
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const tenantName = `Tenant ${room.room_number}`;
      const tenantEmail = `tenant${room.room_number}@example.com`;

      // 1. Create User
      const userRes = await sql`
        INSERT INTO users (name, email, password, role)
        VALUES (${tenantName}, ${tenantEmail}, ${hashedPassword}, 'Tenant')
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `;
      const userId = userRes[0].id;

      // 2. Create Tenant record
      await sql`
        INSERT INTO tenants (user_id, room_id, name, email, phone, status)
        VALUES (${userId}, ${room.id}, ${tenantName}, ${tenantEmail}, '081-000-000${i}', 'Active')
        ON CONFLICT (email) DO NOTHING
      `;

      // 3. Update Room
      await sql`
        UPDATE rooms SET status = 'Occupied', tenant_id = ${userId} WHERE id = ${room.id}
      `;

      // 4. Create Contract
      await sql`
        INSERT INTO contracts (room_id, tenant_id, start_date, end_date, deposit_amount, status, signed_at)
        VALUES (${room.id}, ${userId}, '2026-01-01', '2027-01-01', 5000, 'Signed', NOW())
      `;

      // 5. Create Conversation
      // Assuming columns are user1_id, user2_id or similar. 
      // Let's check first from previous log... wait, I haven't seen them.
      // I'll try to find common names or use the result from convCols.
    }
    console.log('Simulation part 1 (Users, Tenants, Rooms, Contracts) done.');

  } catch (err) {
    console.error(err);
  }
}

main();
