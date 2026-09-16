const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    Write-Host "=== SERVICES STATUS ==="
    Get-Service -Name "*cloudflared*" | Format-Table Name, Status, StartType -AutoSize
    
    Write-Host "=== CLOUDFLARED PROCESSES ==="
    Get-Process cloudflared -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, WorkingSet -AutoSize
    
    Write-Host "=== NODE SERVER PORT 3000 ==="
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess -AutoSize
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
