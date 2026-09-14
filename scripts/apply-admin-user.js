const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@127.0.0.1:3306/smartdomdb');
  console.log('Connected to MySQL!');

  const hash = await bcrypt.hash('admin', 10);
  console.log('Bcrypt hash created:', hash);

  // 1. platform_admins
  try {
    const [pa] = await conn.query('SELECT id, name, email FROM platform_admins WHERE name = "admin" OR email = "admin"');
    if (pa.length > 0) {
      await conn.query('UPDATE platform_admins SET password = ?, is_active = 1 WHERE id = ?', [hash, pa[0].id]);
      console.log('✅ Updated platform_admins (id=' + pa[0].id + ') password to "admin"');
    } else {
      await conn.query('INSERT INTO platform_admins (name, email, password, role, is_active) VALUES ("admin", "admin", ?, "super_admin", 1)', [hash]);
      console.log('✅ Inserted admin into platform_admins');
    }
  } catch (err) {
    console.error('Error on platform_admins:', err.message);
  }

  // 2. users
  try {
    const [u] = await conn.query('SELECT id, name, email FROM users WHERE name = "admin" OR email = "admin"');
    if (u.length > 0) {
      await conn.query('UPDATE users SET password = ?, is_active = 1 WHERE id = ?', [hash, u[0].id]);
      console.log('✅ Updated users (id=' + u[0].id + ') password to "admin"');
    } else {
      await conn.query('INSERT INTO users (name, email, password, role, is_active) VALUES ("admin", "admin", ?, "owner", 1)', [hash]);
      console.log('✅ Inserted admin into users');
    }
  } catch (err) {
    console.error('Error on users:', err.message);
  }

  console.log('🎉 Credentials user="admin", password="admin" setup successfully!');
  await conn.end();
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
