const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');
  
  const [users] = await conn.query("SELECT id, email, name, role FROM users WHERE role = 'owner'");
  console.log('Owners:', users);
  
  const [dorms] = await conn.query('SELECT id, owner_id, dorm_name, status FROM dormitory_registry');
  console.log('Dorms in registry:', dorms);
  
  const [rooms] = await conn.query('SELECT id, dorm_id, room_number, status FROM rooms LIMIT 10');
  console.log('Sample rooms:', rooms);

  const [contracts] = await conn.query('SELECT id, tenant_id, room_id, status, deposit_amount, slip_url FROM contracts ORDER BY id DESC LIMIT 5');
  console.log('Latest contracts:', contracts);
  
  await conn.end();
}

run().catch(console.error);
