const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');
  const hash = await bcrypt.hash('smartdom', 10);

  console.log('1. Setting up tenant@gmail.com and tenant@kaset2.com passwords to "smartdom"...');
  
  // 1. Ensure tenant@gmail.com exists in users
  const [existingUser] = await conn.query('SELECT id FROM users WHERE email = ?', ['tenant@gmail.com']);
  let tenantUserId;
  if (existingUser.length === 0) {
    const [res] = await conn.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['ผู้เช่าทดสอบ (Tenant)', 'tenant@gmail.com', hash, 'tenant']
    );
    tenantUserId = res.insertId;
  } else {
    tenantUserId = existingUser[0].id;
    await conn.query('UPDATE users SET password = ?, role = ? WHERE id = ?', [hash, 'tenant', tenantUserId]);
  }

  // 2. Also update tenant@kaset2.com and kritsakorn8011@gmail.com passwords
  await conn.query('UPDATE users SET password = ? WHERE email = ?', [hash, 'tenant@kaset2.com']);
  await conn.query('UPDATE users SET password = ? WHERE email = ?', [hash, 'kritsakorn8011@gmail.com']);
  await conn.query('UPDATE users SET password = ? WHERE email = ?', [hash, 'kritsakorn8012@gmail.com']);

  // 3. Ensure tenant record for tenant@gmail.com exists
  const [existingTenant] = await conn.query('SELECT id FROM tenants WHERE email = ? OR user_id = ?', ['tenant@gmail.com', tenantUserId]);
  let tenantId;
  if (existingTenant.length === 0) {
    const [res] = await conn.query(
      'INSERT INTO tenants (user_id, dorm_id, room_id, name, email, phone, status) VALUES (?, 1, 1, ?, ?, ?, ?)',
      [tenantUserId, 'ผู้เช่าทดสอบ (Tenant)', 'tenant@gmail.com', '0899999999', 'Active']
    );
    tenantId = res.insertId;
  } else {
    tenantId = existingTenant[0].id;
    await conn.query('UPDATE tenants SET user_id = ?, email = ?, dorm_id = 1, room_id = 1, status = "Active" WHERE id = ?', [tenantUserId, 'tenant@gmail.com', tenantId]);
  }

  // 4. Ensure bills exist for tenant@gmail.com
  const [bills] = await conn.query('SELECT id FROM bills WHERE tenant_id = ?', [tenantId]);
  if (bills.length === 0) {
    await conn.query(
      'INSERT INTO bills (tenant_id, dorm_id, room_number, title, amount, room_amount, water_units, electric_units, water_amount, electric_amount, billing_cycle, due_date, status) VALUES (?, 1, "101", "บิลค่าเช่าและค่าน้ำ-ไฟ ประจำเดือน สิงหาคม 2569", 3850.00, 3200.00, 8.0, 50.0, 160.00, 490.00, "สิงหาคม 2569", "2026-08-31 23:59:59", "Unpaid")',
      [tenantId]
    );
    await conn.query(
      'INSERT INTO bills (tenant_id, dorm_id, room_number, title, amount, room_amount, water_units, electric_units, water_amount, electric_amount, billing_cycle, due_date, status) VALUES (?, 1, "101", "บิลค่าเช่าและค่าน้ำ-ไฟ ประจำเดือน กรกฎาคม 2569", 3720.00, 3200.00, 6.0, 45.0, 120.00, 400.00, "กรกฎาคม 2569", "2026-07-31 23:59:59", "Paid")',
      [tenantId]
    );
  }

  // 5. Check tenant@kaset2.com bills
  const [kasetBills] = await conn.query('SELECT b.id, b.title, b.status FROM bills b JOIN tenants t ON b.tenant_id = t.id WHERE t.email = "tenant@kaset2.com"');
  console.log('tenant@kaset2.com bills count:', kasetBills.length);

  console.log('✅ Setup completed successfully!');
  console.log('   tenant@gmail.com / smartdom -> Tenant ID:', tenantId, '(Room 101)');
  console.log('   tenant@kaset2.com / smartdom -> Has', kasetBills.length, 'bills');
  console.log('   kritsakorn8011@gmail.com / smartdom -> Ready');

  await conn.end();
}

seed().catch(console.error);
