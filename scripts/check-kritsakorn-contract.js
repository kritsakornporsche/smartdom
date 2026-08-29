const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const sqlCommands = `
    USE smartdomdb;
    SELECT * FROM tenants WHERE email LIKE '%kritsakorn%' OR user_id IN (SELECT id FROM users WHERE email LIKE '%kritsakorn%');
    SELECT * FROM contracts WHERE tenant_id IN (SELECT id FROM tenants WHERE email LIKE '%kritsakorn%');
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
}).on('error', err => {
  // ignore or log
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
