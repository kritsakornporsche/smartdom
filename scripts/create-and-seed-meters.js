const { neon } = require('../lib/mysql-adapter');
require('dotenv').config({ path: '.env.local' });

(async () => {
  console.log('⚡ Creating and Seeding 6-Month Meter Readings...');
  const sql = neon(process.env.DATABASE_URL);

  // 1. Create table
  await sql`
    CREATE TABLE IF NOT EXISTS meter_readings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dorm_id INT NOT NULL DEFAULT 1,
      room_id INT NOT NULL,
      type ENUM('Water', 'Electricity') NOT NULL,
      previous_reading DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      current_reading DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      billing_cycle VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('✅ Table meter_readings ready.');

  // 2. Clear old readings
  await sql`DELETE FROM meter_readings WHERE id > 0`;

  // 3. Fetch all rooms
  const rooms = await sql`SELECT id, room_number, dorm_id FROM rooms ORDER BY dorm_id ASC, id ASC`;
  console.log(`Found ${rooms.length} rooms to seed meter readings for.`);

  const cycles = [
    { cycle: '2026-03', month: 3 },
    { cycle: '2026-04', month: 4 },
    { cycle: '2026-05', month: 5 },
    { cycle: '2026-06', month: 6 },
    { cycle: '2026-07', month: 7 },
    { cycle: '2026-08', month: 8 }
  ];

  let count = 0;
  for (const r of rooms) {
    let waterPrev = 100 + (r.id * 7) % 50;
    let elecPrev = 500 + (r.id * 23) % 200;

    for (const c of cycles) {
      const waterUsed = Math.floor(4 + ((r.id + c.month) % 7)); // 4 - 10 units
      const elecUsed = Math.floor(55 + ((r.id * 3 + c.month * 7) % 65)); // 55 - 120 units

      const waterCurr = waterPrev + waterUsed;
      const elecCurr = elecPrev + elecUsed;

      // Insert Water
      await sql`
        INSERT INTO meter_readings (dorm_id, room_id, type, previous_reading, current_reading, billing_cycle, created_at)
        VALUES (${r.dorm_id}, ${r.id}, 'Water', ${waterPrev}, ${waterCurr}, ${c.cycle}, ${'2026-0' + c.month + '-25 08:30:00'})
      `;

      // Insert Electricity
      await sql`
        INSERT INTO meter_readings (dorm_id, room_id, type, previous_reading, current_reading, billing_cycle, created_at)
        VALUES (${r.dorm_id}, ${r.id}, 'Electricity', ${elecPrev}, ${elecCurr}, ${c.cycle}, ${'2026-0' + c.month + '-25 08:35:00'})
      `;

      count += 2;
      waterPrev = waterCurr;
      elecPrev = elecCurr;
    }
  }

  console.log(`🎉 Successfully seeded ${count} meter readings across 6 months!`);
})();
