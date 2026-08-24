const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [cols] = await conn.query('DESCRIBE users');
  console.log('users table columns:', cols);
  await conn.end();
})();
