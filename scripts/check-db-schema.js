const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables:', tables.map(t => t.table_name));
    
    for (const table of ['users', 'rooms', 'dormitory_profile']) {
      if (tables.some(t => t.table_name === table)) {
        const cols = await sql`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = ${table}
          ORDER BY ordinal_position
        `;
        console.log(`\n--- ${table.toUpperCase()} COLUMNS ---`);
        console.log(cols.map(c => `${c.column_name} (${c.data_type})`));
      }
    }

    // Check mapping
    const mapping = await sql`
      SELECT u.email, d.id as dorm_id, d.name as dorm_name
      FROM users u
      LEFT JOIN dormitory_profile d ON d.owner_id = u.id
      WHERE u.email = 'testowner@test.test'
    `;
    console.log('\n--- OWNER MAPPING ---');
    console.log(JSON.stringify(mapping, null, 2));

    // Check rooms for that dorm
    if (mapping.length > 0 && mapping[0].dorm_id) {
        const rooms = await sql`SELECT count(*) FROM rooms WHERE dorm_id = ${mapping[0].dorm_id}`;
        console.log(`\n--- ROOM COUNT FOR DORM ${mapping[0].dorm_id} ---`);
        console.log(rooms[0]);
    }

  } catch (e) {
    console.error(e);
  }
}
check();
