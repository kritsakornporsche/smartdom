const { neon } = require('../lib/mysql-adapter.js');
require('dotenv').config({ path: '.env.local' });

async function seedExploreDorms() {
  const connectionUrl = process.env.DATABASE_URL.replace(/smartdom_dorm_1$/, 'smartdomdb').replace(/smartdom_platform$/, 'smartdomdb');
  const sql = neon(connectionUrl);

  try {
    console.log('🚀 Seeding dormitories for explore...');

    // 1. Create a dummy owner user
    let ownerId;
    const existingOwner = await sql`SELECT id FROM users WHERE email = 'dummy_owner@smartdom.local'`;
    
    if (existingOwner.length > 0) {
      ownerId = existingOwner[0].id;
      console.log(`Found existing dummy owner ID: ${ownerId}`);
    } else {
      const insertUserRes = await sql`
        INSERT INTO users (email, password, name, primary_role) 
        VALUES ('dummy_owner@smartdom.local', 'password', 'Dummy Owner', 'owner')
      `;
      // In MySQL with mysql2 adapter using neon simulation, insertId might be in the result object
      // But let's just re-select it
      const newOwner = await sql`SELECT id FROM users WHERE email = 'dummy_owner@smartdom.local'`;
      ownerId = newOwner[0].id;
      console.log(`Created new dummy owner ID: ${ownerId}`);
    }

    const mockDorms = [
      {
        name: 'The Grand Residence',
        phone: '02-111-2222',
        address: '101 ถนนสุขุมวิท แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110',
        cover_image: '/luxury_dorm_building_1_1775739456274.png',
        description: 'หอพักสุดหรูใจกลางเมือง เดินทางสะดวก ใกล้ BTS',
        pet_friendly: 0,
        has_parking: 1,
        has_air_con: 1,
        has_wifi: 1,
        has_lan: 1,
        rooms: [
          { number: '101', price: 6500, type: 'Studio' },
          { number: '102', price: 6500, type: 'Studio' },
          { number: '201', price: 8000, type: '1 Bedroom' }
        ]
      },
      {
        name: 'Cozy Cat Corner',
        phone: '02-333-4444',
        address: '22 ซอยลาดพร้าว 1 แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900',
        cover_image: null,
        description: 'หอพักสำหรับคนรักสัตว์ เลี้ยงแมวได้ มีพื้นที่ส่วนกลาง',
        pet_friendly: 1,
        has_parking: 0,
        has_air_con: 1,
        has_wifi: 1,
        has_lan: 0,
        rooms: [
          { number: 'A1', price: 4500, type: 'Standard' },
          { number: 'A2', price: 4500, type: 'Standard' }
        ]
      },
      {
        name: 'Budget Stay',
        phone: '02-555-6666',
        address: '55 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240',
        cover_image: null,
        description: 'หอพักราคาประหยัด ใกล้มหาวิทยาลัย',
        pet_friendly: 0,
        has_parking: 1,
        has_air_con: 0,
        has_wifi: 1,
        has_lan: 0,
        rooms: [
          { number: '101', price: 2500, type: 'Fan Room' },
          { number: '102', price: 2500, type: 'Fan Room' },
          { number: '201', price: 3000, type: 'AirCon Room' }
        ]
      },
      {
        name: 'Premium Suites',
        phone: '02-777-8888',
        address: '77 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400',
        cover_image: '/luxury_dorm_building_1_1775739456274.png',
        description: 'ห้องพักกว้างขวาง พร้อมสิ่งอำนวยความสะดวกครบครัน',
        pet_friendly: 1,
        has_parking: 1,
        has_air_con: 1,
        has_wifi: 1,
        has_lan: 1,
        rooms: [
          { number: 'V1', price: 9000, type: 'VIP Suite' },
          { number: 'V2', price: 9500, type: 'VIP Suite' }
        ]
      }
    ];

    for (const d of mockDorms) {
      console.log(`Processing dorm: ${d.name}`);
      
      // Check if dorm exists
      const existingDorm = await sql`SELECT id FROM dormitory_registry WHERE dorm_name = ${d.name}`;
      let dormId;

      if (existingDorm.length > 0) {
        dormId = existingDorm[0].id;
        console.log(`  Dorm exists with ID: ${dormId}`);
      } else {
        await sql`
          INSERT INTO dormitory_registry (owner_id, dorm_name, phone, address, status)
          VALUES (${ownerId}, ${d.name}, ${d.phone}, ${d.address}, 'Active')
        `;
        const newDorm = await sql`SELECT id FROM dormitory_registry WHERE dorm_name = ${d.name}`;
        dormId = newDorm[0].id;
        console.log(`  Created dorm with ID: ${dormId}`);
      }

      // Profile
      const existingProfile = await sql`SELECT id FROM dormitory_profile WHERE dorm_id = ${dormId}`;
      if (existingProfile.length === 0) {
        await sql`
          INSERT INTO dormitory_profile 
            (dorm_id, pet_friendly, has_parking, has_air_con, has_wifi, has_lan, description, cover_image)
          VALUES 
            (${dormId}, ${d.pet_friendly}, ${d.has_parking}, ${d.has_air_con}, ${d.has_wifi}, ${d.has_lan}, ${d.description}, ${d.cover_image})
        `;
        console.log(`  Created profile for dorm ${dormId}`);
      } else {
        await sql`
          UPDATE dormitory_profile 
          SET pet_friendly = ${d.pet_friendly}, has_parking = ${d.has_parking}, 
              has_air_con = ${d.has_air_con}, has_wifi = ${d.has_wifi}, 
              has_lan = ${d.has_lan}, description = ${d.description}, cover_image = ${d.cover_image}
          WHERE dorm_id = ${dormId}
        `;
        console.log(`  Updated profile for dorm ${dormId}`);
      }

      // Rooms
      for (const r of d.rooms) {
        const existingRoom = await sql`SELECT id FROM rooms WHERE dorm_id = ${dormId} AND room_number = ${r.number}`;
        if (existingRoom.length === 0) {
          await sql`
            INSERT INTO rooms (dorm_id, room_number, room_type, price, status, floor)
            VALUES (${dormId}, ${r.number}, ${r.type}, ${r.price}, 'Available', 1)
          `;
          console.log(`    Created room ${r.number}`);
        }
      }
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error seeding dormitories:', err);
    process.exit(1);
  }
}

seedExploreDorms();
