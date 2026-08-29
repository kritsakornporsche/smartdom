const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const ps = `
    Get-ChildItem -Path "C:\\kritsakorn\\smartdom\\.next\\static\\css" | Format-Table -AutoSize
    Get-ChildItem -Path "C:\\kritsakorn\\smartdom\\.next\\static" | Format-Table -AutoSize
  `;
  const encoded = Buffer.from(ps, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).on('error', e => {}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
