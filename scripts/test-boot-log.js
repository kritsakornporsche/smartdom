const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    Write-Host "=== 1. SCHEDULED TASK INFO ==="
    Get-ScheduledTaskInfo -TaskName "SmartDomServer" | Format-List
    
    Write-Host "=== 2. RUNNING START-SERVER.BAT DIRECTLY TO SEE OUTPUT ==="
    Set-Location "C:\\kritsakorn\\smartdom"
    $proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c C:\\kritsakorn\\smartdom\\start-server.bat" -RedirectStandardOutput "C:\\kritsakorn\\smartdom\\server_boot.log" -RedirectStandardError "C:\\kritsakorn\\smartdom\\server_err.log" -PassThru
    
    Write-Host "Waiting 8 seconds for server to start..."
    Start-Sleep -Seconds 8
    
    Write-Host "=== 3. CHECKING SERVER BOOT LOG ==="
    if (Test-Path "C:\\kritsakorn\\smartdom\\server_boot.log") {
      Get-Content "C:\\kritsakorn\\smartdom\\server_boot.log" -Tail 20
    }
    
    Write-Host "=== 4. CHECKING SERVER ERROR LOG ==="
    if (Test-Path "C:\\kritsakorn\\smartdom\\server_err.log") {
      Get-Content "C:\\kritsakorn\\smartdom\\server_err.log" -Tail 20
    }
    
    Write-Host "=== 5. PORT 3000 STATUS ==="
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess
  `;

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
