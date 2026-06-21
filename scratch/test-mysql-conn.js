const mysql = require('mysql2/promise');

async function test() {
  try {
    console.log('Testing connection to local XAMPP MySQL (localhost:3306)...');
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    console.log('✅ Connected successfully!');
    const [rows] = await conn.query('SELECT version() AS version');
    console.log('MySQL Version:', rows[0].version);
    await conn.end();
  } catch (err) {
    console.error('❌ Failed to connect to MySQL:', err.message);
  }
}

test();
