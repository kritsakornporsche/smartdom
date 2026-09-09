const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting SSH to optimize remote database connection & build...');

conn.on('ready', () => {
  console.log('SSH Connected! Updating .env.local on remote server to localhost:3306 ...');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    // Upload optimized mysql-adapter.js
    sftp.fastPut('lib/mysql-adapter.js', 'C:/kritsakorn/smartdom/lib/mysql-adapter.js', (err2) => {
      if (err2) throw err2;
      console.log('✅ lib/mysql-adapter.js uploaded to remote server.');

      const psScript = `
        Set-Location "C:\\kritsakorn\\smartdom"
        $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
        
        Write-Host "1. UPDATING .env.local TO LOCALHOST:3306 FOR ULTRA-FAST ACCESS..."
        $envContent = @"
AUTH_SECRET="A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8"
DATABASE_URL="mysql://smartdom:smartdom@localhost:3306/smartdomdb"
AUTH_TRUST_HOST="true"
NEXTAUTH_URL="http://kritsakorn.thddns.net:5993"
AUTH_URL="http://kritsakorn.thddns.net:5993"
"@
        Set-Content -Path ".env.local" -Value $envContent -Encoding utf8
        Write-Host ".env.local updated successfully."
        
        Write-Host ""
        Write-Host "2. RUNNING NEXT.JS BUILD WITH OPTIMIZED POOL..."
        & npm run build
        
        Write-Host ""
        Write-Host "3. RESTARTING PM2 SERVICE..."
        & $pm2 delete all 2>&1 | Out-Null
        & $pm2 start "node_modules\\next\\dist\\bin\\next" --name smartdom --cwd "C:\\kritsakorn\\smartdom" -- start --hostname 0.0.0.0 --port 3000
        & $pm2 save
        
        Write-Host ""
        Write-Host "4. WAITING 3 SECONDS..."
        Start-Sleep -Seconds 3
        
        Write-Host ""
        Write-Host "5. TESTING RESPONSE TIME ON HOMEPAGE & API..."
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $r1 = Invoke-WebRequest -Uri "http://localhost:3000/api/updates" -UseBasicParsing
        $sw.Stop()
        Write-Host "✅ /api/updates response time: $($sw.ElapsedMilliseconds) ms (Status: $($r1.StatusCode))"
        
        $sw.Restart()
        $r2 = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
        $sw.Stop()
        Write-Host "✅ Homepage response time: $($sw.ElapsedMilliseconds) ms (Status: $($r2.StatusCode))"
      `;

      const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
      const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

      conn.exec(cmd, (err3, stream) => {
        if (err3) throw err3;
        stream.on('data', d => process.stdout.write(d.toString()));
        stream.stderr.on('data', d => process.stderr.write(d.toString()));
        stream.on('close', code => {
          console.log('\nDeployment and speed test completed with code:', code);
          conn.end();
        });
      });
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 15000
});
