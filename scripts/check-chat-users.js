const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const code = `
    const mysql = require('mysql2/promise');
    (async () => {
      const pool = mysql.createPool('mysql://smartdom:smartdom@localhost:3306/smartdomdb');
      const [dorms] = await pool.query('SELECT id, dorm_name, owner_id, owner_name FROM dormitory_registry');
      console.log('Dorms:', JSON.stringify(dorms, null, 2));
      const [users] = await pool.query("SELECT id, name, email, role, primary_role FROM users WHERE role = 'owner' OR primary_role = 'owner'");
      console.log('Owner Users:', JSON.stringify(users, null, 2));
      await pool.end();
      process.exit(0);
    })();
  `;
  const b64 = Buffer.from(code).toString('base64');
  conn.exec(`powershell.exe -NoProfile -Command "cd C:\\kritsakorn\\smartdom; node -e \\"eval(Buffer.from('${b64}', 'base64').toString())\\""`, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: 'kritsakorn.thddns.net', port: 5995, username: 'buain', password: 'Zn@27124700' });
