const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

async function mockRooms() {
  try {
    const dorms = await sql`SELECT id, name FROM dormitory_profile`;
    console.log(`Found ${dorms.length} dormitories.`);

    if (dorms.length === 0) {
      console.log('No dormitories found. Please create a dorm first.');
      return;
    }

    const roomTypes = [
      { name: 'Standard', price: 4500, amenities: ['Wifi', 'Air Conditioning'] },
      { name: 'Deluxe', price: 5500, amenities: ['Wifi', 'Air Conditioning', 'TV', 'Refrigerator'] },
      { name: 'Premium', price: 7500, amenities: ['Wifi', 'Air Conditioning', 'TV', 'Refrigerator', 'Microwave', 'Kitchenette'] }
    ];

    for (const dorm of dorms) {
      console.log(`Creating 10 rooms for: ${dorm.name} (ID: ${dorm.id})`);
      
      for (let i = 1; i <= 10; i++) {
        const floor = i <= 5 ? 1 : 2;
        const roomNum = `${floor}${i < 10 ? '0' + i : i}`;
        const typeIdx = i % 3;
        const type = roomTypes[typeIdx];
        
        await sql`
          INSERT INTO rooms (room_number, room_type, price, status, floor, dorm_id, amenities, images)
          VALUES (
            ${roomNum}, 
            ${type.name}, 
            ${type.price}, 
            'Available', 
            ${floor}, 
            ${dorm.id}, 
            ${'{' + type.amenities.map(a => `"${a}"`).join(',') + '}'},
            '{}'
          )
          ON CONFLICT (room_number, dorm_id) DO NOTHING
        `;
      }
    }

    console.log('Finished simulating rooms for all dormitories.');
  } catch (err) {
    console.error('Error mocking rooms:', err);
  }
}

mockRooms();
