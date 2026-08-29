const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');
  
  console.log('--- Checking active user accounts and their bills ---');
  const [users] = await conn.query("SELECT id, email, name, role FROM users WHERE email IN ('tenant@gmail.com', 'tenant@kaset2.com', 'kritsakorn8011@gmail.com', 'kritsakorn8012@gmail.com', 'tenant_d1_r101@smartdom.ac.th', 'tenant_d4_r406@smartdom.ac.th')");
  
  for (const u of users) {
    const [bills] = await conn.query(`
      SELECT b.id, b.title, b.amount, b.status, b.billing_cycle, b.due_date 
      FROM bills b
      WHERE b.tenant_id IN (
        SELECT t.id FROM tenants t 
        WHERE t.email = ? 
           OR t.user_id = ?
           OR t.user_id IN (SELECT u2.id FROM users u2 WHERE u2.email = ?)
      )
      ORDER BY b.id DESC
    `, [u.email, u.id, u.email]);

    console.log(`User: ${u.email} (ID: ${u.id}, Role: ${u.role}) -> Bills count: ${bills.length}`);
    if (bills.length > 0) {
      console.log('   Recent bill:', bills[0]);
    }
  }

  // Also check bills with no tenant match
  const [orphanBills] = await conn.query('SELECT count(*) as count FROM bills WHERE tenant_id NOT IN (SELECT id FROM tenants)');
  console.log('Orphan bills count:', orphanBills[0].count);

  await conn.end();
}

main().catch(console.error);
