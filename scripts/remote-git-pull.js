const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to remote server to deploy via git pull and fresh build...');

conn.on('ready', () => {
  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    
    Write-Host "1. CHECKING GIT STATUS & PULLING LATEST COMMITS..."
    git fetch origin main
    git reset --hard origin/main
    git status
    
    Write-Host ""
    Write-Host "2. RUNNING NPM INSTALL FOR ANY NEW DEPENDENCIES (e.g. tesseract.js)..."
    npm install
    
    Write-Host ""
    Write-Host "3. RUNNING PRODUCTION BUILD ON SERVER..."
    npm run build
    
    Write-Host ""
    Write-Host "4. RESTARTING BACKGROUND SMARTDOM SERVER..."
    Stop-ScheduledTask -TaskName "SmartDomServer" -ErrorAction SilentlyContinue | Out-Null
    Start-Sleep -Seconds 2
    Start-ScheduledTask -TaskName "SmartDomServer" -ErrorAction SilentlyContinue | Out-Null
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "5. VERIFYING PROCESS & HTTP HEALTH CHECK..."
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess -AutoSize
    
    try {
      $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
      Write-Host "✅ Local Server is ONLINE! HTTP Status: $($res.StatusCode)"
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
      console.log('\n--- Remote Deploy Finished With Code:', code, '---');
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
