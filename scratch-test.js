const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const url = process.env.DATABASE_URL.replace(/smartdom_dorm_1$/, 'smartdomdb').replace(/smartdom_platform$/, 'smartdomdb');
  const pool = mysql.createPool(url);

  console.log('Fetching all users from database...');
  const [users] = await pool.query('SELECT id, name, email, primary_role FROM users');
  console.log('Seeded Users in database:', users);

  process.exit(0);
}
test();
