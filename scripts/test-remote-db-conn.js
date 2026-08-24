const mysql = require('mysql2/promise');

const creds = [
  { user: 'smartdom', password: 'smartdom', database: 'smartdomdb' },
  { user: 'root', password: '', database: 'smartdomdb' },
  { user: 'root', password: 'Password123!', database: 'smartdomdb' },
  { user: 'root', password: 'root', database: 'smartdomdb' },
  { user: 'buain', password: 'Zn@27124700', database: 'smartdomdb' },
  { user: 'root', password: 'Zn@27124700', database: 'smartdomdb' },
  { user: 'root', password: 'smartdom', database: 'smartdomdb' },
  { user: 'smartdom', password: 'smartdom', database: 'mysql' },
  { user: 'root', password: '', database: 'mysql' },
];

(async () => {
  console.log('Testing connection to kritsakorn.thddns.net:5994...');
  for (const c of creds) {
    try {
      console.log(`Trying ${c.user}:${c.password ? '***' : '(empty)'}@kritsakorn.thddns.net:5994/${c.database}...`);
      const conn = await mysql.createConnection({
        host: 'kritsakorn.thddns.net',
        port: 5994,
        user: c.user,
        password: c.password,
        database: c.database,
        connectTimeout: 5000
      });
      console.log(`🎉 SUCCESS with ${c.user}@kritsakorn.thddns.net:5994/${c.database}!`);
      const [rows] = await conn.query('SHOW TABLES');
      console.log('Tables:', rows);
      await conn.end();
      return;
    } catch (e) {
      console.log(`❌ Failed: ${e.message}`);
    }
  }
})();
