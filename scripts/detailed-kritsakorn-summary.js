const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');

  console.log('\n================ 1. USERS ================');
  const [users] = await conn.query("SELECT id, email, name, role FROM users WHERE email LIKE '%kritsakorn%' OR name LIKE '%kritsakorn%'");
  console.table(users);

  console.log('\n================ 2. TENANT PROFILE ================');
  const [tenants] = await conn.query("SELECT id, user_id, name, email, dorm_id, room_id, status FROM tenants WHERE email LIKE '%kritsakorn%' OR name LIKE '%kritsakorn%'");
  console.table(tenants);

  console.log('\n================ 3. TENANT BILLS ================');
  const [bills] = await conn.query("SELECT id, tenant_id, title, amount, status, billing_cycle, due_date, room_number, IF(slip_url IS NOT NULL, 'Has Slip', 'No Slip') as slip_status FROM bills WHERE tenant_id IN (SELECT id FROM tenants WHERE email LIKE '%kritsakorn%' OR name LIKE '%kritsakorn%')");
  console.table(bills);

  console.log('\n================ 4. DORMS IN SYSTEM ================');
  const [dorms] = await conn.query("SELECT dr.id, dr.dorm_name, dr.owner_id, u.email as owner_email, u.name as owner_name FROM dormitory_registry dr LEFT JOIN users u ON dr.owner_id = u.id");
  console.table(dorms);

  console.log('\n================ 5. OWNER (Dorm 1) RECENT BILLS ================');
  const [ownerBills] = await conn.query("SELECT b.id, b.title, b.amount, b.status, b.billing_cycle, b.dorm_id, b.room_number, IF(b.slip_url IS NOT NULL, 'Has Slip', 'No Slip') as slip_status, t.name as tenant_name, t.email as tenant_email FROM bills b LEFT JOIN tenants t ON b.tenant_id = t.id WHERE b.dorm_id = 1 ORDER BY b.id DESC LIMIT 10");
  console.table(ownerBills);

  await conn.end();
}

main().catch(console.error);
