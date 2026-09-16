const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to build and start server cleanly...');

conn.on('ready', () => {
  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    
    Write-Host "1. KILLING PREVIOUS PROCESSES..."
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    
    Write-Host "2. RUNNING NPM RUN BUILD..."
    npm run build
    
    Write-Host "3. VERIFYING .next DIRECTORY..."
    Test-Path "C:\\kritsakorn\\smartdom\\.next\\BUILD_ID"
    
    Write-Host "4. STARTING SMARTDOM SERVER AS SCHEDULED TASK..."
    Start-ScheduledTask -TaskName "SmartDomServer"
    
    Write-Host "Waiting 10 seconds for server to start..."
    Start-Sleep -Seconds 10
    
    Write-Host "5. CHECKING PORT 3000..."
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess
    
    Write-Host "6. TESTING HEALTH CHECK HTTP GET http://localhost:3000 ..."
    try {
      $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
      Write-Host "✅ Server is ONLINE! HTTP Status: $($res.StatusCode)"
    } catch {
      Write-Host "❌ Health check failed: $($_.Exception.Message)"
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    if (err) {
      console.error('Remote exec error:', err);
      conn.end();
      return;
    }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('\n--- Build and Start finished with code:', code, '---');
      conn.end();
    });
  });
}).on('error', err => {
  if (err.code !== 'ECONNRESET') console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 20000
});
