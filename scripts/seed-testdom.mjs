import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function seed() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    const resDorm = await sql`SELECT id, name FROM dormitory_profile WHERE name ILIKE '%tetsdom%' OR name ILIKE '%testdom%' LIMIT 1`;
    if (resDorm.length === 0) {
      console.log('Dorm "testdom" not found.');
      return;
    }
    
    const dormId = resDorm[0].id;
    console.log(`Found Dorm: ${resDorm[0].name} (ID: ${dormId})`);
    
    // Check rooms for room numbers
    const rooms = await sql`SELECT id, room_number FROM rooms WHERE dorm_id = ${dormId} LIMIT 5`;
    const roomNum1 = rooms.length > 0 ? rooms[0].room_number : '101';
    const roomNum2 = rooms.length > 1 ? rooms[1].room_number : '102';

    // 1. Accounting Transactions
    const accounts = [
      { type: 'Income', cat: 'Rent', amt: 5000, desc: 'ค่าเช่าห้อง ' + roomNum1, date: '2026-04-01' },
      { type: 'Income', cat: 'Water', amt: 120, desc: 'ค่าน้ำห้อง ' + roomNum1, date: '2026-04-01' },
      { type: 'Income', cat: 'Electricity', amt: 450, desc: 'ค่าไฟห้อง ' + roomNum1, date: '2026-04-01' },
      { type: 'Expense', cat: 'Maintenance', amt: 1500, desc: 'ซ่อมแอร์ห้อง ' + roomNum2, date: '2026-04-05' },
      { type: 'Expense', cat: 'Cleaning', amt: 800, desc: 'ทำความสะอาดทางเดิน', date: '2026-04-10' },
      { type: 'Income', cat: 'Rent', amt: 5500, desc: 'ค่าเช่าห้อง ' + roomNum2, date: '2026-04-02' },
      { type: 'Expense', cat: 'Water Bill', amt: 2100, desc: 'ค่าน้ำการประปา', date: '2026-04-12' },
      { type: 'Expense', cat: 'Electricity Bill', amt: 3500, desc: 'ค่าไฟการไฟฟ้า', date: '2026-04-12' },
    ];
    
    for (const a of accounts) {
      await sql`
        INSERT INTO accounting_transactions (dorm_id, transaction_type, category, amount, description, transaction_date) 
        VALUES (${dormId}, ${a.type}, ${a.cat}, ${a.amt}, ${a.desc}, ${a.date})
      `;
    }
    console.log(`Inserted ${accounts.length} accounting records`);

    // 2. Parcels
    // dorm_id, room_number, recipient_name, tracking_number, carrier, status, image_url
    const parcels = [
        { room_num: roomNum1, name: 'สมชาย รักดี', tracking: 'TH1234567890', carrier: 'Kerry Express', status: 'Pending', img: null },
        { room_num: roomNum2, name: 'สมหญิง ชื่นใจ', tracking: 'RB098765432TH', carrier: 'Thailand Post', status: 'Picked Up', img: null },
        { room_num: roomNum1, name: 'สมชาย รักดี', tracking: 'SHP0987123', carrier: 'Shopee Xpress', status: 'Pending', img: null }
    ];
    
    for (const p of parcels) {
        await sql`
            INSERT INTO parcels (dorm_id, room_number, recipient_name, tracking_number, carrier, status, image_url) 
            VALUES (${dormId}, ${p.room_num}, ${p.name}, ${p.tracking}, ${p.carrier}, ${p.status}, ${p.img})
        `;
    }
    console.log(`Inserted ${parcels.length} parcels records`);

    // 3. Vehicles
    // dorm_id, room_number, owner_name, license_plate, province, vehicle_type, brand_model, color
    const vehicles = [
        { room_num: roomNum1, owner: 'สมชาย รักดี', plate: 'กท 1234', prov: 'กรุงเทพมหานคร', type: 'Car', brand: 'Honda Civic', color: 'White' },
        { room_num: roomNum2, owner: 'สมหญิง ชื่นใจ', plate: '1กข 9999', prov: 'เชียงใหม่', type: 'Motorcycle', brand: 'Yamaha Fino', color: 'Red' },
        { room_num: roomNum1, owner: 'สมชาติ', plate: '2ขค 555', prov: 'นนทบุรี', type: 'Motorcycle', brand: 'Honda Wave', color: 'Black' }
    ];
    
    for (const v of vehicles) {
        await sql`
            INSERT INTO vehicles (dorm_id, room_number, owner_name, license_plate, province, vehicle_type, brand_model, color) 
            VALUES (${dormId}, ${v.room_num}, ${v.owner}, ${v.plate}, ${v.prov}, ${v.type}, ${v.brand}, ${v.color})
        `;
    }
    console.log(`Inserted ${vehicles.length} vehicles records`);

  } catch (err) {
    console.error('Error:', err);
  }
}

seed();
