const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');
  
  const [pendingContracts] = await conn.query(`
    SELECT c.*, r.dorm_id, r.room_number, dr.dorm_name, dr.owner_id
    FROM contracts c
    JOIN rooms r ON c.room_id = r.id
    JOIN dormitory_registry dr ON r.dorm_id = dr.id
    WHERE c.status = 'PendingOwnerSignature'
  `);
  console.log('Pending Contracts in DB:', pendingContracts);

  const [allContracts] = await conn.query(`
    SELECT c.id, c.status, r.dorm_id, r.room_number, dr.dorm_name, dr.owner_id
    FROM contracts c
    JOIN rooms r ON c.room_id = r.id
    JOIN dormitory_registry dr ON r.dorm_id = dr.id
    ORDER BY c.id DESC LIMIT 10
  `);
  console.log('Latest 10 Contracts:', allContracts);
  
  await conn.end();
}

run().catch(console.error);
