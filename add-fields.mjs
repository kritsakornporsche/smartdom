import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log("Altering dormitory_profile table...");
    await sql`
      ALTER TABLE dormitory_profile 
      ADD COLUMN IF NOT EXISTS water_rate DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS electricity_rate DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS pet_friendly BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS has_wifi BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS facilities TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS map_url TEXT DEFAULT '';
    `;
    console.log("dormitory_profile updated.");

    console.log("Altering rooms table...");
    await sql`
      ALTER TABLE rooms
      ADD COLUMN IF NOT EXISTS amenities TEXT DEFAULT '';
    `;
    console.log("rooms updated.");

    // Update existing mock data to valid values
    await sql`
      UPDATE dormitory_profile
      SET water_rate = 18, electricity_rate = 8, pet_friendly = true, has_wifi = true, has_parking = true,
          facilities = 'ซักรีด, ฟิตเนส 24 ชม., สระว่ายน้ำระบบเกลือ, Co-working space, ลิฟต์โดยสาร',
          map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.312!2d100.53!3d13.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ1JzAwLjAiTiAxMDAlMzEnNDguMCJF!5e0!3m2!1sen!2sth!4v1'
      WHERE name LIKE '%SmartDom%';
    `;

    await sql`
      UPDATE dormitory_profile
      SET water_rate = 20, electricity_rate = 10, pet_friendly = false, has_wifi = true, has_parking = true,
          facilities = 'เครื่องซักผ้าหยอดเหรียญ, ตู้น้ำหยอดเหรียญ, ร้านอาหารตามสั่ง, ลิฟต์โดยสาร',
          map_url = 'https://www.google.com/maps/embed?pb='
      WHERE name NOT LIKE '%SmartDom%';
    `;

    await sql`
      UPDATE rooms
      SET amenities = '{"เตียง 5 ฟุต", "ตู้เสื้อผ้า", "โต๊ะเครื่องแป้ง", "แอร์", "เครื่องทำน้ำอุ่น", "ทีวีสมาร์ท", "ตู้เย็น", "ไมโครเวฟ"}'
      WHERE room_type = 'Deluxe' OR room_type = 'Suite';
    `;

    await sql`
      UPDATE rooms
      SET amenities = '{"เตียง 5 ฟุต", "ตู้เสื้อผ้า", "แอร์", "เครื่องทำน้ำอุ่น"}'
      WHERE room_type = 'Standard' OR room_type = 'Studio';
    `;

    console.log("Mock data appended.");
  } catch (err) {
    console.error(err);
  }
}

main();
