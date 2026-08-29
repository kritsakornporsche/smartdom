const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const ps = `
    & "C:\\xampp\\mysql\\bin\\mysql.exe" -u root -e "
      USE smartdomdb;
      UPDATE bills SET status = 'Pending', slip_url = 'test_slip_url_success' WHERE id = 784;
      SELECT id, tenant_id, title, amount, status, slip_url FROM bills WHERE id = 784;
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
