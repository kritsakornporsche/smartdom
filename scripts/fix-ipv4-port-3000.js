const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Diagnosing why external port 5993 sends connection reset...');

  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
    
    Write-Host "1. STOPPING OLD PM2 INSTANCES..."
    & $pm2 delete all 2>&1 | Out-Null
    
    Write-Host ""
    Write-Host "2. STARTING NEXT.JS WITH EXPLICIT HOSTNAME 0.0.0.0 AND PORT 3000..."
    & $pm2 start "node_modules\\next\\dist\\bin\\next" --name smartdom --cwd "C:\\kritsakorn\\smartdom" -- start --hostname 0.0.0.0 --port 3000
    & $pm2 save
    
    Write-Host ""
    Write-Host "3. WAITING 3 SECONDS FOR NODE LISTENER..."
    Start-Sleep -Seconds 3
    
    Write-Host ""
    Write-Host "4. CHECKING NETSTAT FOR IPv4 0.0.0.0:3000 LISTENING:"
    netstat -ano | findstr :3000
    
    Write-Host ""
    Write-Host "5. OPENING FIREWALL RULES FOR PORT 3000 (INBOUND & OUTBOUND):"
    Remove-NetFirewallRule -DisplayName "SmartDom 3000 Inbound" -ErrorAction SilentlyContinue | Out-Null
    New-NetFirewallRule -DisplayName "SmartDom 3000 Inbound" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow | Out-Null
    
    Write-Host ""
    Write-Host "6. TEST ACCESS VIA IPv4 192.168.1.104:3000:"
    try {
      $r = Invoke-WebRequest -Uri "http://192.168.1.104:3000" -UseBasicParsing -TimeoutSec 3
      Write-Host "✅ IPv4 192.168.1.104:3000 Status: $($r.StatusCode)"
    } catch {
      Write-Host "❌ IPv4 192.168.1.104:3000 Error: $($_.Exception.Message)"
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('\nCompleted with code:', code);
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
