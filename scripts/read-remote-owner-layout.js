const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    Get-Content "C:\\kritsakorn\\smartdom\\app\\owner\\layout.tsx"
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).on('error', () => {}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
