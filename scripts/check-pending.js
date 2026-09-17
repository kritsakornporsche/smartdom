const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const code = `
    const mysql = require('mysql2/promise');
    (async () => {
      const p = mysql.createPool('mysql://smartdom:smartdom@localhost:3306/smartdomdb');
      const [owners] = await p.query("SELECT id, email, name, role, primary_role FROM users WHERE role = 'owner' OR primary_role = 'owner'");
      console.log('OWNERS:', owners);

      const [dormReg] = await p.query("SELECT id, dorm_name, owner_id, owner_email FROM dormitory_registry");
      console.log('DORM_REGISTRY:', dormReg);

      await p.end();
      process.exit(0);
    })();
  `;
  const b64 = Buffer.from(code).toString('base64');
  conn.exec(`powershell.exe -NoProfile -Command "cd C:\\kritsakorn\\smartdom; node -e \\"eval(Buffer.from('${b64}', 'base64').toString())\\""`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => { conn.end(); process.exit(0); });
  });
}).connect({ host: 'kritsakorn.thddns.net', port: 5995, username: 'buain', password: 'Zn@27124700' });
