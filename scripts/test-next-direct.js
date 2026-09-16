const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $node = "C:\\Program Files\\nodejs\\node.exe"
    $next = "C:\\kritsakorn\\smartdom\\node_modules\\next\\dist\\bin\\next"
    
    # Run with timeout to capture exact error output
    $p = Start-Process -FilePath $node -ArgumentList "$next start -p 3000 -H 0.0.0.0" -RedirectStandardOutput "C:\\kritsakorn\\smartdom\\test_next.log" -RedirectStandardError "C:\\kritsakorn\\smartdom\\test_next_err.log" -PassThru
    
    Start-Sleep -Seconds 5
    Write-Host "Process Responding:" $p.Responding "HasExited:" $p.HasExited
    if ($p.HasExited) {
      Write-Host "Exit Code:" $p.ExitCode
    }
    
    Write-Host "=== STDOUT ==="
    if (Test-Path "C:\\kritsakorn\\smartdom\\test_next.log") {
      Get-Content "C:\\kritsakorn\\smartdom\\test_next.log"
    }
    Write-Host "=== STDERR ==="
    if (Test-Path "C:\\kritsakorn\\smartdom\\test_next_err.log") {
      Get-Content "C:\\kritsakorn\\smartdom\\test_next_err.log"
    }
    
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table
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
