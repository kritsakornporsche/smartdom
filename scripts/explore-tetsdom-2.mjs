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
    const tenantCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'tenants'`;
    console.log('Tenant Columns:', tenantCols.map(c => c.column_name).join(', '));

    const contractCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'contracts'`;
    console.log('Contract Columns:', contractCols.map(c => c.column_name).join(', '));

    const chatMsgCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'chat_messages'`;
    console.log('Chat Message Columns:', chatMsgCols.map(c => c.column_name).join(', '));

    const roomCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'rooms'`;
    console.log('Room Columns:', roomCols.map(c => c.column_name).join(', '));

    const tetsdomRooms = await sql`SELECT * FROM rooms WHERE dorm_id = 6`;
    console.log('Tetsdom Rooms count:', tetsdomRooms.length);
    
  } catch (err) {
    console.error(err);
  }
}

main();
