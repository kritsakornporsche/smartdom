const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting SSH to set up permanent 24/7 Windows background service for SmartDom...');

conn.on('ready', () => {
  console.log('SSH Connected! Creating start-server.bat and permanent Windows Scheduled Task...');

  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    
    Write-Host "1. CREATING start-server.bat..."
    $batContent = @"
@echo off
cd /d C:\\kritsakorn\\smartdom
set NODE_ENV=production
set PORT=3000
set HOSTNAME=0.0.0.0
node node_modules\\next\\dist\\bin\\next start -p 3000 -H 0.0.0.0
"@
    Set-Content -Path "C:\\kritsakorn\\smartdom\\start-server.bat" -Value $batContent -Encoding ascii
    Write-Host "start-server.bat created."
    
    Write-Host ""
    Write-Host "2. KILLING ANY OLD NODE ON PORT 3000..."
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    
    Write-Host ""
    Write-Host "3. CREATING PERMANENT WINDOWS TASK (RUNS INDEPENDENTLY OF SSH)..."
    schtasks /delete /tn "SmartDomServer" /f 2>&1 | Out-Null
    schtasks /create /tn "SmartDomServer" /tr "C:\\kritsakorn\\smartdom\\start-server.bat" /sc ONSTART /ru "buain" /rp "Zn@27124700" /f
    
    Write-Host ""
    Write-Host "4. RUNNING THE TASK NOW..."
    schtasks /run /tn "SmartDomServer"
    
    Write-Host ""
    Write-Host "5. WAITING 5 SECONDS FOR NEXT.JS INITIALIZATION..."
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "6. CHECKING PORT 3000 & LOCALHOST HTTP GET..."
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess
    try {
      $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
      Write-Host "✅ Status: $($r.StatusCode) - SmartDom is LIVE on localhost:3000!"
    } catch {
      Write-Host "❌ Error: $($_.Exception.Message)"
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('\nPermanent service creation finished with code:', code);
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 15000
});
