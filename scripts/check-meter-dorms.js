const { neon } = require('../lib/mysql-adapter');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`SELECT dorm_id, COUNT(*) as c FROM meter_readings GROUP BY dorm_id`;
  console.log('Meter readings per dorm:', rows);

  const dorms = await sql`SELECT id, dorm_name, owner_id FROM dormitory_registry`;
  console.log('Dorms:', dorms);

  const users = await sql`SELECT id, email, name, role FROM users WHERE role = 'owner'`;
  console.log('Owners:', users);
})();
