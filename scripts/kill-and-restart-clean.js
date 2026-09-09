const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Killing all zombie node processes and restarting PM2 cleanly...');

  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
    
    Write-Host "1. STOPPING PM2..."
    & $pm2 delete all 2>&1 | Out-Null
    
    Write-Host "2. KILLING ALL ORPHAN NODE PROCESSES..."
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    Write-Host "3. VERIFYING PORT 3000 IS TOTALLY FREE..."
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess
    
    Write-Host "4. STARTING FRESH PM2 SMARTDOM SERVICE..."
    & $pm2 start "node_modules\\next\\dist\\bin\\next" --name smartdom --cwd "C:\\kritsakorn\\smartdom" -- start -p 3000
    & $pm2 save
    
    Write-Host "5. WAITING 3 SECONDS FOR PROCESS..."
    Start-Sleep -Seconds 3
    
    Write-Host "6. CHECKING PORT 3000 LISTENING STATUS (SHOULD BE 0.0.0.0 and ::)..."
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess
    
    Write-Host "7. TESTING STATIC CHUNK REQUEST ON LOCALHOST:3000..."
    try {
      $res = Invoke-WebRequest -Uri "http://localhost:3000/_next/static/chunks/app/layout-1ffe9631cf7b94c1.js" -UseBasicParsing -TimeoutSec 3
      Write-Host "✅ Static Chunk Status: $($res.StatusCode), Size: $($res.Content.Length)"
    } catch {
      Write-Host "❌ Static Chunk Error: $($_.Exception.Message)"
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('\nClean kill & restart completed with code:', code);
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
