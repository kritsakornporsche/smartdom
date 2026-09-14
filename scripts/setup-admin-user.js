const { Client } = require('ssh2');
const bcrypt = require('bcryptjs');

const conn = new Client();
console.log('Connecting to remote SSH to inspect and set admin user with password admin...');

conn.on('ready', () => {
  const nodeScript = `
    const mysql = require('mysql2/promise');
    const bcrypt = require('bcryptjs');

    (async () => {
      const conn = await mysql.createConnection('mysql://smartdom:smartdom@127.0.0.1:3306/smartdomdb');
      
      console.log('=== 1. CHECK CURRENT ADMINS ===');
      const [admins] = await conn.query('SELECT id, name, email, password, role FROM platform_admins');
      console.log('platform_admins:', admins);

      const [users] = await conn.query('SELECT id, name, email, password, role FROM users WHERE name = "admin" OR email = "admin"');
      console.log('users with admin:', users);

      const hash = await bcrypt.hash('admin', 10);
      console.log('Generated bcrypt hash for "admin":', hash);

      // Upsert in platform_admins
      const [existingPA] = await conn.query('SELECT id FROM platform_admins WHERE name = "admin" OR email = "admin"');
      if (existingPA.length > 0) {
        await conn.query('UPDATE platform_admins SET password = ?, is_active = 1 WHERE id = ?', [hash, existingPA[0].id]);
        console.log('✅ Updated platform_admins (id=' + existingPA[0].id + ') password to admin');
      } else {
        await conn.query('INSERT INTO platform_admins (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)', [
          'admin', 'admin', hash, 'super_admin', 1
        ]);
        console.log('✅ Inserted new admin in platform_admins');
      }

      // Upsert in users table
      const [existingU] = await conn.query('SELECT id FROM users WHERE name = "admin" OR email = "admin"');
      if (existingU.length > 0) {
        await conn.query('UPDATE users SET password = ?, role = "owner" WHERE id = ?', [hash, existingU[0].id]);
        console.log('✅ Updated users (id=' + existingU[0].id + ') password to admin');
      } else {
        await conn.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
          'admin', 'admin', hash, 'owner'
        ]);
        console.log('✅ Inserted new admin in users');
      }

      console.log('🎉 Done configuring admin/admin!');
      await conn.end();
    })().catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
  `;

  conn.exec(`node -e "${nodeScript.replace(/\r?\n/g, ' ')}"`, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('Finished with code:', code);
      conn.end();
    });
  });
}).on('error', err => {
  console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 10000
});
