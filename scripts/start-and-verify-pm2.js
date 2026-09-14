const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to SSH to check running Node processes and start PM2 service...');

conn.on('ready', () => {
  const psScript = `
    Write-Host "=== 1. CHECK RUNNING NODE PROCESSES ==="
    Get-Process node -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, WorkingSet64, Path -AutoSize
    
    Write-Host ""
    Write-Host "=== 2. ALL LISTENING TCP PORTS (PORT 3000, 5993, 5995) ==="
    Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in @(3000, 5993, 5995) } | Format-Table LocalAddress, LocalPort, State, OwningProcess -AutoSize
    
    Write-Host ""
    Write-Host "=== 3. PM2 STATUS UNDER BUAIN USER ==="
    $env:PM2_HOME = "C:\\Users\\buain\\.pm2"
    $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
    & $pm2 list
    
    Write-Host ""
    Write-Host "=== 4. START PM2 IF EMPTY ==="
    Set-Location "C:\\kritsakorn\\smartdom"
    & $pm2 delete smartdom 2>&1 | Out-Null
    & $pm2 start "node_modules\\next\\dist\\bin\\next" --name smartdom --cwd "C:\\kritsakorn\\smartdom" -- start -p 3000
    & $pm2 save
    
    Start-Sleep -Seconds 3
    Write-Host ""
    Write-Host "=== 5. CHECK PM2 LIST & PORT 3000 ==="
    & $pm2 list
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess -AutoSize
    
    Write-Host ""
    Write-Host "=== 6. HTTP REQUEST TEST ==="
    try {
      $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
      Write-Host "HTTP Status: " $res.StatusCode " (SUCCESS)"
    } catch {
      Write-Host "HTTP Fail: " $_.Exception.Message
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('data', (d) => process.stdout.write(d.toString()));
    stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
    stream.on('close', (code) => {
      console.log('\nCommand finished with exit code:', code);
      conn.end();
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 10000
});
