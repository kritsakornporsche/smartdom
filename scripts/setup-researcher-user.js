const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');

(async () => {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/DATABASE_URL="([^"]+)"/);
    const dbUrl = match ? match[1] : 'mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb';
    console.log('Connecting to DB...');

    const conn = await mysql.createConnection(dbUrl);
    const [existing] = await conn.execute("SELECT id, name, email, role FROM users WHERE LOWER(email) = 'researcher' OR LOWER(name) = 'researcher'");
    console.log('Existing researcher:', existing);

    const hash = await bcrypt.hash('Researcher', 10);
    if (existing.length > 0) {
      await conn.execute("UPDATE users SET name = 'Researcher', email = 'Researcher', role = 'researcher', primary_role = 'researcher', password = ?, is_active = 1 WHERE id = ?", [hash, existing[0].id]);
      console.log('Updated existing researcher user ID:', existing[0].id);
    } else {
      const [res] = await conn.execute("INSERT INTO users (name, email, role, primary_role, password, is_active) VALUES ('Researcher', 'Researcher', 'researcher', 'researcher', ?, 1)", [hash]);
      console.log('Inserted new researcher user ID:', res.insertId);
    }

    await conn.end();
    console.log('Setup Researcher user successfully completed!');
  } catch (err) {
    console.error('Error setting up researcher user:', err);
    process.exit(1);
  }
})();
