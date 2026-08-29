const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const ps = `
    if (Test-Path "C:\\Users\\buain\\.pm2\\logs") {
      Get-ChildItem "C:\\Users\\buain\\.pm2\\logs" | ForEach-Object {
        Write-Host "=== Log: $($_.Name) ==="
        Get-Content $_.FullName -Tail 50
      }
    }
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
