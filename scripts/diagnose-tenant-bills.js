const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const ps = `
    $env:MYSQL_PWD = ""
    & "C:\\xampp\\mysql\\bin\\mysql.exe" -u root -e "
      USE smartdomdb;
      SELECT '=== TENANT RECORD ===' as title;
      SELECT id, user_id, name, email, dorm_id, room_id FROM tenants WHERE email LIKE '%kritsakorn%' OR user_id IN (SELECT id FROM users WHERE email LIKE '%kritsakorn%');
      SELECT '=== CONTRACT RECORD ===' as title;
      SELECT id, dorm_id, room_id, tenant_id, status FROM contracts WHERE tenant_id IN (SELECT id FROM tenants WHERE email LIKE '%kritsakorn%');
      SELECT '=== BILLS RECORD ===' as title;
      SELECT id, tenant_id, title, amount, status, billing_cycle, due_date FROM bills WHERE tenant_id IN (SELECT id FROM tenants WHERE email LIKE '%kritsakorn%');
    "
  `;
  const encoded = Buffer.from(ps, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    stream.on('data', d => {
      const s = d.toString();
      if (!s.startsWith('#< CLIXML') && !s.startsWith('<Objs Version=')) {
        process.stdout.write(s);
      }
    });
    stream.on('close', () => conn.end());
  });
}).on('error', e => {}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
