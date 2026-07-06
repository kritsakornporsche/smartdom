const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const url = process.env.DATABASE_URL.replace(/smartdom_dorm_1$/, 'smartdomdb').replace(/smartdom_platform$/, 'smartdomdb');
  const pool = mysql.createPool(url);

  const email = 'kritsakorn801@gmail.com';
  console.log('Testing for email:', email);

  const [users] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  console.log('Users:', users);
  
  if (users.length > 0) {
    const ownerId = users[0].id;
    const [dorms] = await pool.query("SELECT id, dorm_name, CAST(id AS CHAR) as db_name FROM dormitory_registry WHERE owner_id = ? AND status = 'Active'", [ownerId]);
    console.log('Dorms:', dorms);
  }

  process.exit(0);
}
test();
