const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    Write-Host "=== 1. SCHEDULED TASKS ==="
    Get-ScheduledTask | Where-Object { $_.TaskName -like "*SmartDom*" -or $_.TaskName -like "*node*" } | Format-List TaskName, State
    
    Write-Host ""
    Write-Host "=== 2. CONTENTS OF START-SERVER.BAT ==="
    if (Test-Path "C:\\kritsakorn\\smartdom\\start-server.bat") {
      Get-Content "C:\\kritsakorn\\smartdom\\start-server.bat"
    } else {
      Write-Host "start-server.bat not found"
    }
    
    Write-Host ""
    Write-Host "=== 3. PM2 LOGS / ERROR LOGS ==="
    $errLog = "C:\\Users\\buain\\.pm2\\logs\\smartdom-error.log"
    if (Test-Path $errLog) {
      Get-Content $errLog -Tail 30
    } else {
      Write-Host "No error log at $errLog"
    }
    
    Write-Host ""
    Write-Host "=== 4. PM2 OUT LOGS ==="
    $outLog = "C:\\Users\\buain\\.pm2\\logs\\smartdom-out.log"
    if (Test-Path $outLog) {
      Get-Content $outLog -Tail 30
    } else {
      Write-Host "No out log at $outLog"
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('data', (d) => process.stdout.write(d.toString()));
    stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
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
