require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const resDorm = await pool.query("SELECT id, name FROM dormitory_profile WHERE name ILIKE '%tetsdom%' OR name ILIKE '%testdom%' LIMIT 1");
    if (resDorm.rows.length === 0) {
      console.log('Dorm "tetsdom" not found.');
      return;
    }
    
    const dormId = resDorm.rows[0].id;
    console.log(`Found Dorm: ${resDorm.rows[0].name} (ID: ${dormId})`);
    
    // Check if rooms exist, if not we just use dormId directly if schema allows.
    // wait, for parcels we usually need a room_id to notify the user. Let's find rooms in this dorm
    const resRooms = await pool.query("SELECT id, room_number FROM room_details WHERE dorm_id = $1 LIMIT 5", [dormId]);
    const rooms = resRooms.rows;
    if (rooms.length === 0) {
        console.log("No rooms found in this dorm for parcels/vehicles.");
        // We'll insert without rooms if possible, or just skip if room_id is required
    }
    
    const roomId1 = rooms.length > 0 ? rooms[0].id : null;
    const roomNum1 = rooms.length > 0 ? rooms[0].room_number : '101';
    
    const roomId2 = rooms.length > 1 ? rooms[1].id : roomId1;
    const roomNum2 = rooms.length > 1 ? rooms[1].room_number : '102';

    // 1. Accounting Transactions
    const accounts = [
      { type: 'Income', cat: 'Rent', amt: 5000, desc: 'ค่าเช่าห้อง 101', date: '2026-04-01' },
      { type: 'Income', cat: 'Water', amt: 120, desc: 'ค่าน้ำห้อง 101', date: '2026-04-01' },
      { type: 'Income', cat: 'Electricity', amt: 450, desc: 'ค่าไฟห้อง 101', date: '2026-04-01' },
      { type: 'Expense', cat: 'Maintenance', amt: 1500, desc: 'ซ่อมแอร์ห้อง 102', date: '2026-04-05' },
      { type: 'Expense', cat: 'Cleaning', amt: 800, desc: 'ทำความสะอาดทางเดิน', date: '2026-04-10' },
      { type: 'Income', cat: 'Rent', amt: 5500, desc: 'ค่าเช่าห้อง 102', date: '2026-04-02' },
      { type: 'Expense', cat: 'Water Bill', amt: 2100, desc: 'ค่าน้ำการประปา', date: '2026-04-12' },
      { type: 'Expense', cat: 'Electricity Bill', amt: 3500, desc: 'ค่าไฟการไฟฟ้า', date: '2026-04-12' },
    ];
    
    for (const a of accounts) {
      await pool.query(
        "INSERT INTO accounting_transactions (dorm_id, transaction_type, category, amount, description, transaction_date) VALUES ($1, $2, $3, $4, $5, $6)",
        [dormId, a.type, a.cat, a.amt, a.desc, a.date]
      );
    }
    console.log(`Inserted ${accounts.length} accounting records`);

    // 2. Parcels
    // Needs room_id (number) and maybe tenant_name string etc.
    if (roomId1) {
        const parcels = [
            { room_id: roomId1, room_num: roomNum1, desc: 'กล่อง Shopee M', expected: '2026-04-22', status: 'Pending' },
            { room_id: roomId2, room_num: roomNum2, desc: 'ซองจดหมาย EMS', expected: '2026-04-21', status: 'Delivered' },
            { room_id: roomId1, room_num: roomNum1, desc: 'Lazada พัสดุใหญ่', expected: '2026-04-22', status: 'Pending' }
        ];
        
        for (const p of parcels) {
            try {
                // Determine schema for parcels... usually it's room_id, description, arrival_date, status.
                await pool.query(
                    "INSERT INTO parcels (dorm_id, room_id, description, arrival_date, status) VALUES ($1, $2, $3, $4, $5)",
                    [dormId, p.room_id, p.desc, p.expected, p.status]
                );
            } catch (e) {
                console.log("Could not insert parcel:", e.message);
            }
        }
        console.log(`Inserted ${parcels.length} parcels`);
    }

    // 3. Vehicles
    if (roomId1) {
        const vehicles = [
            { room_id: roomId1, type: 'Car', plate: 'กท 1234', brand: 'Honda Civic', status: 'Approved' },
            { room_id: roomId2, type: 'Motorcycle', plate: '1กข 9999', brand: 'Yamaha Fino', status: 'Approved' },
            { room_id: roomId1, type: 'Motorcycle', plate: '2ขค 555', brand: 'Honda Wave', status: 'Pending' }
        ];
        
        for (const v of vehicles) {
            try {
                await pool.query(
                    "INSERT INTO vehicles (dorm_id, room_id, vehicle_type, license_plate, make_model, status) VALUES ($1, $2, $3, $4, $5, $6)",
                    [dormId, v.room_id, v.type, v.plate, v.brand, v.status]
                );
            } catch (e) {
                console.log("Could not insert vehicle:", e.message);
            }
        }
        console.log(`Inserted ${vehicles.length} vehicles`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

seed();
