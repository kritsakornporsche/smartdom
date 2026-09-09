const mysql = require('mysql2/promise');

async function checkKritsakorn() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');

  console.log('\n======================================================');
  console.log('=== 1. ALL USERS WITH KRITSAKORN / กฤษกร ===');
  console.log('======================================================');
  const [users] = await conn.query("SELECT id, email, name, role, created_at FROM users WHERE email LIKE '%kritsakorn%' OR name LIKE '%kritsakorn%' OR name LIKE '%กฤษกร%'");
  console.table(users);

  console.log('\n======================================================');
  console.log('=== 2. TENANT PROFILE FOR KRITSAKORN ===');
  console.log('======================================================');
  const [tenants] = await conn.query("SELECT t.id, t.user_id, t.name, t.email, t.dorm_id, t.room_id, t.status, r.room_number, dr.dorm_name FROM tenants t LEFT JOIN rooms r ON t.room_id = r.id LEFT JOIN dormitory_registry dr ON t.dorm_id = dr.id WHERE t.email LIKE '%kritsakorn%' OR t.name LIKE '%kritsakorn%'");
  console.table(tenants);

  console.log('\n======================================================');
  console.log('=== 3. CONTRACTS FOR KRITSAKORN ===');
  console.log('======================================================');
  const [contracts] = await conn.query("SELECT c.id, c.tenant_id, c.room_id, c.start_date, c.end_date, c.deposit_amount, c.status, r.room_number, dr.dorm_name FROM contracts c LEFT JOIN rooms r ON c.room_id = r.id LEFT JOIN dormitory_registry dr ON r.dorm_id = dr.id WHERE c.tenant_id IN (SELECT id FROM tenants WHERE email LIKE '%kritsakorn%' OR name LIKE '%kritsakorn%')");
  console.table(contracts);

  console.log('\n======================================================');
  console.log('=== 4. BILLS FOR KRITSAKORN TENANT ===');
  console.log('======================================================');
  const [bills] = await conn.query("SELECT b.id, b.tenant_id, b.title, b.amount, b.status, b.billing_cycle, b.due_date, b.room_number, b.slip_url, t.name as tenant_name, t.email as tenant_email FROM bills b LEFT JOIN tenants t ON b.tenant_id = t.id WHERE t.email LIKE '%kritsakorn%' OR t.name LIKE '%kritsakorn%'");
  console.table(bills);

  console.log('\n======================================================');
  console.log('=== 5. OWNER ACCOUNTS (kritsakorn) DORMS & MANAGED BILLS ===');
  console.log('======================================================');
  const [ownerDorms] = await conn.query("SELECT dr.id, dr.dorm_name, dr.address, dr.owner_id, u.email as owner_email, u.name as owner_name FROM dormitory_registry dr LEFT JOIN users u ON dr.owner_id = u.id WHERE u.email LIKE '%kritsakorn%'");
  console.table(ownerDorms);

  const [ownerBills] = await conn.query("SELECT b.id, b.title, b.amount, b.status, b.billing_cycle, b.room_number, b.slip_url, t.name as tenant_name, t.email as tenant_email FROM bills b LEFT JOIN tenants t ON b.tenant_id = t.id WHERE b.dorm_id IN (SELECT id FROM dormitory_registry WHERE owner_id IN (SELECT id FROM users WHERE email LIKE '%kritsakorn%')) ORDER BY b.id DESC LIMIT 15");
  console.log('Owner Managed Bills (Recent 15):');
  console.table(ownerBills);

  await conn.end();
}

checkKritsakorn().catch(console.error);
