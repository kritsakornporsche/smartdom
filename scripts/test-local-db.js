const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@127.0.0.1:3306/smartdomdb');
  console.log('Connected to local MySQL successfully!');
  const [users] = await conn.query('SELECT id, email, name, role, status FROM users ORDER BY id DESC LIMIT 10');
  console.table(users);
  await conn.end();
}

main().catch(err => {
  console.error('MySQL connect error:', err);
});
