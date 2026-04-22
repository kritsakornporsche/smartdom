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
    const rooms = await sql`SELECT * FROM rooms WHERE dorm_id = ${dormId} ORDER BY room_number ASC`;
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const tenantNumber = room.room_number;
      const tenantName = `ผู้เช่าห้อง ${tenantNumber}`;
      const tenantEmail = `tenant${tenantNumber}@example.com`;
      const phone = `081-000-0${100 + i}`;

      console.log(`Setting up ${tenantName}...`);

      // 1. Create/Get User
      let userId;
      const existingUser = await sql`SELECT id FROM users WHERE email = ${tenantEmail}`;
      if (existingUser.length > 0) {
        userId = existingUser[0].id;
        await sql`UPDATE users SET name = ${tenantName}, role = 'Tenant' WHERE id = ${userId}`;
      } else {
        const userRes = await sql`
          INSERT INTO users (name, email, password, role)
          VALUES (${tenantName}, ${tenantEmail}, ${hashedPassword}, 'Tenant')
          RETURNING id
        `;
        userId = userRes[0].id;
      }

      // 2. Create/Update Tenant record
      await sql`
        INSERT INTO tenants (user_id, room_id, name, email, phone, status)
        VALUES (${userId}, ${room.id}, ${tenantName}, ${tenantEmail}, ${phone}, 'Active')
        ON CONFLICT (email) DO UPDATE SET 
          room_id = EXCLUDED.room_id, 
          status = EXCLUDED.status,
          user_id = EXCLUDED.user_id
      `;

      // 3. Update Room
      await sql`
        UPDATE rooms SET status = 'Occupied', tenant_id = ${userId} WHERE id = ${room.id}
      `;

      // 4. Create Contract
      await sql`
        INSERT INTO contracts (room_id, tenant_id, start_date, end_date, deposit_amount, status, signed_at)
        VALUES (${room.id}, ${userId}, '2026-04-01', '2027-04-01', 5000, 'Signed', NOW())
        ON CONFLICT DO NOTHING
      `;

      // 5. Create/Get Conversation
      let convId;
      const existingConv = await sql`SELECT id FROM conversations WHERE dorm_id = ${dormId} AND guest_id = ${userId}`;
      
      if (existingConv.length > 0) {
        convId = existingConv[0].id;
      } else {
        const convRes = await sql`
          INSERT INTO conversations (dorm_id, guest_id, owner_id, last_message)
          VALUES (${dormId}, ${userId}, ${ownerId}, 'สวัสดีครับ ผมย้ายตัวเข้าพักเรียบร้อยครับ')
          RETURNING id
        `;
        convId = convRes[0].id;
      }

      // 6. Create Chat Messages
      // Clear old messages for clean simulation if wanted, or just add
      await sql`
        INSERT INTO chat_messages (conversation_id, sender_id, message)
        VALUES 
        (${convId}, ${userId}, ${`สวัสดีครับ ผมผู้เช่าห้อง ${room.room_number} สัญญาเรียบร้อยแล้วครับ`}),
        (${convId}, ${ownerId}, 'ยินดีต้อนรับครับ พักผ่อนให้สบายนะครับ มีอะไรแจ้งผ่านแอปได้เลย'),
        (${convId}, ${userId}, 'ขอบคุณครับ หอพักสวยมากครับ')
      `;
    }
    console.log('Simulation completed successfully for 10 tenants.');

  } catch (err) {
    console.error('Simulation failed:', err);
    console.error(err.stack);
  }
}

main();
