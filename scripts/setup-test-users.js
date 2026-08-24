const bcrypt = require('bcryptjs');
const { neon } = require('../lib/mysql-adapter');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const sql = neon(process.env.DATABASE_URL);
  const hash = await bcrypt.hash('Password123!', 10);
  console.log('Generated hash for Password123!:', hash);

  const testUsers = [
    { name: 'เจ้าของหอพักเกษตร 2', email: 'owner@kaset2.com', role: 'owner', phone: '0812345678' },
    { name: 'ป้าประนอม ผู้ดูแล', email: 'keeper@kaset2.com', role: 'keeper', phone: '0823456789' },
    { name: 'นายณัฐพล ผู้เช่า', email: 'tenant@kaset2.com', role: 'tenant', phone: '0834567890' },
    { name: 'นายอนันต์ ผู้ดูแลระบบ', email: 'admin@kaset2.com', role: 'platform_admin', phone: '0845678901' },
    { name: 'SmartDom Owner', email: 'owner@smartdom.com', role: 'owner', phone: '0899999999' },
    { name: 'สมชาย ผู้เช่า', email: 'somchai@test.com', role: 'tenant', phone: '0888888888' },
  ];

  for (const u of testUsers) {
    const existing = await sql`SELECT id FROM users WHERE email = ${u.email} LIMIT 1`;
    if (existing.length > 0) {
      await sql`UPDATE users SET password = ${hash}, role = ${u.role}, name = ${u.name} WHERE email = ${u.email}`;
      console.log('Updated user:', u.email);
    } else {
      await sql`INSERT INTO users (name, email, password, role) VALUES (${u.name}, ${u.email}, ${hash}, ${u.role})`;
      console.log('Created user:', u.email);
    }
  }

  // Ensure tenant record exists for tenant@kaset2.com
  const tenantUser = await sql`SELECT id FROM users WHERE email = 'tenant@kaset2.com' LIMIT 1`;
  if (tenantUser.length > 0) {
    const existingTenant = await sql`SELECT id FROM tenants WHERE email = 'tenant@kaset2.com' LIMIT 1`;
    if (existingTenant.length === 0) {
      const room = await sql`SELECT id FROM rooms WHERE status = 'Occupied' LIMIT 1`;
      const roomId = room.length > 0 ? room[0].id : 1;
      await sql`INSERT INTO tenants (user_id, room_id, name, email, phone, status) VALUES (${tenantUser[0].id}, ${roomId}, 'นายณัฐพล ผู้เช่า', 'tenant@kaset2.com', '0834567890', 'Active')`;
      console.log('Linked tenant@kaset2.com to room', roomId);
    }
  }

  console.log('✅ Test users ready with password Password123!');
})();
