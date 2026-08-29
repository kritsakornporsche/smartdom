const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected. Starting Smartdom3000 Task...');
  const ps = `
    Start-ScheduledTask -TaskName "Smartdom3000"
    Start-Sleep -Seconds 4
    Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 3000 } | Format-Table
    try {
      $r = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 3
      Write-Host "✅ Health Check: HTTP $($r.StatusCode)"
    } catch {
      Write-Host "Health Check: $($_.Exception.Message)"
    }
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
}).on('error', e => console.error(e.message)).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
