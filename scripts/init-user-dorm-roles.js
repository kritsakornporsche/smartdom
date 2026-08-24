const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const dbs = [
    { name: 'Local Database', url: 'mysql://smartdom:smartdom@localhost:3306/smartdomdb' },
    { name: 'Remote Database (THDDNS)', url: 'mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb' }
  ];

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS user_dorm_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      dorm_id INT NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'guest',
      sub_role VARCHAR(50) NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_dorm_id (dorm_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  for (const db of dbs) {
    console.log(`\n📦 Initializing user_dorm_roles on ${db.name}...`);
    try {
      const conn = await mysql.createConnection(db.url);
      await conn.query(createTableSql);
      console.log(`✅ Table user_dorm_roles created/verified on ${db.name}!`);

      // Seed initial roles from users
      const [users] = await conn.query('SELECT id, role, sub_role FROM users');
      const [dorms] = await conn.query('SELECT id FROM dormitory_registry LIMIT 1');
      const defaultDormId = dorms[0]?.id || 1;

      for (const u of users) {
        const [existing] = await conn.query('SELECT id FROM user_dorm_roles WHERE user_id = ?', [u.id]);
        if (existing.length === 0) {
          await conn.query(
            'INSERT INTO user_dorm_roles (user_id, dorm_id, role, sub_role, is_active) VALUES (?, ?, ?, ?, 1)',
            [u.id, defaultDormId, u.role || 'guest', u.sub_role || null]
          );
        }
      }
      console.log(`✅ Seeded user_dorm_roles for ${users.length} users on ${db.name}!`);
      await conn.end();
    } catch (err) {
      console.error(`❌ Error on ${db.name}:`, err.message);
    }
  }
})();
