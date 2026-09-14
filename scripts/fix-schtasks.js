const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = [
    '$tunnelDir = "C:\\kritsakorn\\tunnel"',
    '$batPath = "$tunnelDir\\start-tunnel.bat"',
    '',
    '$lines = @("@echo off", "cd /d C:\\kritsakorn\\tunnel", "cloudflared.exe tunnel --url http://localhost:3000 > tunnel.log 2>&1")',
    '$lines | Out-File -FilePath $batPath -Encoding ascii',
    '',
    'Write-Host "Registering task with schtasks.exe..."',
    '& schtasks.exe /create /tn "SmartDomTunnel" /tr "C:\\kritsakorn\\tunnel\\start-tunnel.bat" /sc onstart /ru "buain" /rp "Zn@27124700" /f',
    '',
    'Write-Host "Starting SmartDomTunnel task..."',
    '& schtasks.exe /run /tn "SmartDomTunnel"',
    '',
    'Start-Sleep -Seconds 5',
    'Get-Process cloudflared -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, WorkingSet'
  ].join('\r\n');

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).on('error', err => {
  if (err.code !== 'ECONNRESET') console.error(err);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
