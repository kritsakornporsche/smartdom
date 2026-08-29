const { Client } = require('ssh2');

const conn = new Client();
console.log('Force killing stale node process tree and cleanly restarting SmartDom...');

conn.on('ready', () => {
  const psScript = `
    Write-Host "1. Stopping Scheduled Task..."
    Stop-ScheduledTask -TaskName "Smartdom3000" -ErrorAction SilentlyContinue
    
    Write-Host "2. Force killing all node.exe processes..."
    & taskkill.exe /F /IM node.exe /T
    Start-Sleep -Seconds 3

    Write-Host "3. Verifying Port 3000 is cleared..."
    $conn3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($conn3000) {
      Write-Host "Force killing PID: $($conn3000.OwningProcess)"
      Stop-Process -Id $conn3000.OwningProcess -Force -ErrorAction SilentlyContinue
      Start-Sleep -Seconds 2
    }

    Write-Host "4. Starting Scheduled Task Smartdom3000..."
    Start-ScheduledTask -TaskName "Smartdom3000"
    Start-Sleep -Seconds 5

    Write-Host "5. Checking new running process on Port 3000..."
    $newConn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($newConn) {
      $p = Get-Process -Id $newConn.OwningProcess -ErrorAction SilentlyContinue
      Write-Host "✅ New Node Process: PID $($p.Id), Started at $($p.StartTime)"
    } else {
      Write-Host "❌ Port 3000 is not listening yet"
    }

    Write-Host "6. Testing Health Check (HTTP http://127.0.0.1:3000)..."
    try {
      $r = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 5
      Write-Host "✅ Server is ONLINE: HTTP $($r.StatusCode)"
    } catch {
      Write-Host "❌ Health Check failed: $($_.Exception.Message)"
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }
    stream.on('data', d => {
      const s = d.toString();
      if (!s.startsWith('#< CLIXML') && !s.startsWith('<Objs Version=')) {
        process.stdout.write(s);
      }
    });
    stream.on('close', code => {
      console.log('\nRestart finished with exit code:', code);
      conn.end();
    });
  });
}).on('error', e => console.error('SSH Error:', e.message)).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 15000
});
