const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to SSH to restart PM2 with 0.0.0.0 binding...');

conn.on('ready', () => {
  const psScript = `
    $env:PM2_HOME = "C:\\Users\\buain\\.pm2"
    $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
    Set-Location "C:\\kritsakorn\\smartdom"
    
    Write-Host "1. Killing old smartdom processes in PM2..."
    & $pm2 delete smartdom 2>&1 | Out-Null
    & $pm2 delete smartdom-3000 2>&1 | Out-Null
    
    Write-Host "2. Starting smartdom with explicit 0.0.0.0 hostname..."
    & $pm2 start "node_modules\\next\\dist\\bin\\next" --name smartdom --cwd "C:\\kritsakorn\\smartdom" -- start -p 3000 -H 0.0.0.0
    & $pm2 save
    
    Start-Sleep -Seconds 3
    
    Write-Host "3. PM2 Process List:"
    & $pm2 list
    
    Write-Host "4. Port 3000 Netstat:"
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess -AutoSize
    
    Write-Host "5. Localhost Health Check:"
    try {
      $res1 = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
      Write-Host "localhost:3000 -> HTTP Status: $($res1.StatusCode)"
    } catch {
      Write-Host "localhost:3000 Failed: $($_.Exception.Message)"
    }
    
    Write-Host "6. LAN IP Health Check (192.168.1.104:3000):"
    try {
      $res2 = Invoke-WebRequest -Uri "http://192.168.1.104:3000" -UseBasicParsing -TimeoutSec 5
      Write-Host "192.168.1.104:3000 -> HTTP Status: $($res2.StatusCode)"
    } catch {
      Write-Host "192.168.1.104:3000 Failed: $($_.Exception.Message)"
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('data', (d) => process.stdout.write(d.toString()));
    stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
    stream.on('close', (code) => {
      console.log('Finished with exit code:', code);
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
