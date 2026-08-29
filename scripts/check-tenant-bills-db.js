const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const sqlCommands = `
    USE smartdomdb;
    SELECT '=== USERS ===' AS Section;
    SELECT id, name, email, role FROM users;
    SELECT '=== TENANTS ===' AS Section;
    SELECT id, user_id, name, email, dorm_id, room_id FROM tenants;
    SELECT '=== CONTRACTS ===' AS Section;
    SELECT id, dorm_id, room_id, tenant_id, status FROM contracts;
    SELECT '=== BILLS ===' AS Section;
    SELECT id, tenant_id, title, amount, status, billing_cycle, due_date FROM bills;
  `;
  
  const ps = `& 'C:\\xampp\\mysql\\bin\\mysql.exe' -u root -e "${sqlCommands.replace(/\n/g, ' ')}"`;
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
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
