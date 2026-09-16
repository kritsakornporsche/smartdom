const mysql = require('mysql2/promise');

async function clean() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');
  await conn.execute('DELETE FROM users WHERE email = ? OR name = ?', ['kritdanai@gmail.com', 'kritdanai']);
  console.log('✅ Cleaned up kritdanai user from database successfully!');
  const [check] = await conn.execute('SELECT id, name, email FROM users WHERE email = ?', ['kritdanai@gmail.com']);
  console.log('Verification check (should be empty array):', check);
  await conn.end();
  process.exit(0);
}

clean();
