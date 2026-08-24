const { neon } = require('../lib/mysql-adapter');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const sql = neon(process.env.DATABASE_URL);
  const users = await sql`
    SELECT id, name, email, role, phone 
    FROM users 
    WHERE role = 'keeper' OR email LIKE '%keeper%' OR email LIKE '%tech%' OR email LIKE '%maid%'
  `;
  const keepers = await sql`
    SELECT k.*, d.dorm_name 
    FROM keepers k
    LEFT JOIN dormitory_registry d ON k.dorm_id = d.id
  `;
  console.log('--- USERS WITH KEEPER ROLE ---');
  console.log(users);
  console.log('--- KEEPERS TABLE ---');
  console.log(keepers);
})();
