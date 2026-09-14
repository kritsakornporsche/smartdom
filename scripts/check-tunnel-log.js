const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    if (Test-Path "C:\\kritsakorn\\tunnel\\tunnel.log") {
      Get-Content "C:\\kritsakorn\\tunnel\\tunnel.log" | Select-String -Pattern "trycloudflare\\.com" | Select-Object -Last 5
    }
  `;
  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
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
