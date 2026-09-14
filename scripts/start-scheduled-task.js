const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    Write-Host "=== 1. CHECK TASK SCHEDULER SmartDomServer ==="
    Get-ScheduledTask -TaskName "SmartDomServer" -ErrorAction SilentlyContinue | Format-List TaskName, State
    
    Write-Host "=== 2. TRIGGER TASK SCHEDULER SmartDomServer ==="
    Start-ScheduledTask -TaskName "SmartDomServer" -ErrorAction SilentlyContinue
    
    Start-Sleep -Seconds 3
    
    Write-Host "=== 3. CHECK TCP PORT 3000 ==="
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess -AutoSize
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => { console.log('Exit code:', code); conn.end(); });
  });
}).on('error', e => console.error('SSH Error:', e.message)).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 10000
});
