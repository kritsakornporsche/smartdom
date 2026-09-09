const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Starting Next.js in PM2 with explicit --cwd C:\\kritsakorn\\smartdom ...');

  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
    
    Write-Host "1. STOPPING AND DELETING OLD PM2 PROCESS..."
    & $pm2 delete smartdom 2>&1 | Out-Null
    
    Write-Host ""
    Write-Host "2. STARTING SMARTDOM WITH EXPLICIT --cwd C:\\kritsakorn\\smartdom ..."
    & $pm2 start "node_modules\\next\\dist\\bin\\next" --name smartdom --cwd "C:\\kritsakorn\\smartdom" -- start -p 3000
    & $pm2 save
    
    Write-Host ""
    Write-Host "3. WAITING 3 SECONDS..."
    Start-Sleep -Seconds 3
    
    Write-Host ""
    Write-Host "4. PM2 PROCESS LIST:"
    & $pm2 list
    
    Write-Host ""
    Write-Host "5. TESTING STATIC CHUNK REQUEST http://localhost:3000/_next/static/chunks/app/layout-1ffe9631cf7b94c1.js:"
    try {
      $res = Invoke-WebRequest -Uri "http://localhost:3000/_next/static/chunks/app/layout-1ffe9631cf7b94c1.js" -UseBasicParsing -TimeoutSec 3
      Write-Host "✅ Static Chunk File Status: $($res.StatusCode), Size: $($res.Content.Length)"
    } catch {
      Write-Host "❌ Static File Error: $($_.Exception.Message)"
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
