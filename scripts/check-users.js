const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');
  
  const [users] = await conn.query("SELECT id, email, name, role FROM users WHERE role = 'owner' OR role = 'admin'");
  console.log('Owners/Admins in DB:', users);
  
  const [dorms] = await conn.query("SELECT id, owner_id, dorm_name, status FROM dormitory_registry");
  console.log('Dorms:', dorms);

  await conn.end();
}

run().catch(console.error);
