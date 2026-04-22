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
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables:', tables.map(t => t.table_name).join(', '));
    
    const dirmProfile = await sql`SELECT * FROM dormitory_profile WHERE name ILIKE '%tetsdom%'`;
    console.log('Dorm Profile:', JSON.stringify(dirmProfile, null, 2));

    if (dirmProfile.length > 0) {
        const dormId = dirmProfile[0].id;
        const ownerId = dirmProfile[0].owner_id;
        console.log(`Dorm ID: ${dormId}, Owner ID: ${ownerId}`);
        
        // Check columns of bookings and messages
        const bookingCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings'`;
        console.log('Booking Columns:', bookingCols.map(c => c.column_name).join(', '));

        const messageCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'messages'`;
        console.log('Message Columns:', messageCols.map(c => c.column_name).join(', '));
    }
  } catch (err) {
    console.error(err);
  }
}

main();
