const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Checking static files and Next.js error logs...');

  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
    
    Write-Host "1. CHECKING .next/static/chunks/app FILES:"
    Get-ChildItem -Path "C:\\kritsakorn\\smartdom\\.next\\static\\chunks\\app" -ErrorAction SilentlyContinue | Format-Table Name, Length, LastWriteTime
    
    Write-Host ""
    Write-Host "2. TESTING HTTP GET http://localhost:3000/_next/static/chunks/app/layout-73d574aeae6b7ae9.js:"
    try {
      $res = Invoke-WebRequest -Uri "http://localhost:3000/_next/static/chunks/app/layout-73d574aeae6b7ae9.js" -UseBasicParsing -TimeoutSec 3
      Write-Host "Static File Status: $($res.StatusCode), Size: $($res.Content.Length)"
    } catch {
      Write-Host "Static File Error: $($_.Exception.Message)"
    }
    
    Write-Host ""
    Write-Host "3. PM2 LOGS (ERRORS):"
    & $pm2 logs smartdom --lines 30 --err --nostream
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
