const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const ps = `
    Get-Service -Name *pm2*, *node* -ErrorAction SilentlyContinue | Format-Table
    Get-ScheduledTask | Where-Object { $_.TaskName -match 'pm2|smartdom|node' } | Format-Table
  `;
  const encoded = Buffer.from(ps, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
