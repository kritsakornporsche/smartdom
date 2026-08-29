const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting SSH to restart smartdom server...');

conn.on('ready', () => {
  console.log('SSH Connection Established! Executing clean server restart...');
  
  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
    
    Write-Host "=========================================="
    Write-Host "1. STOPPING AND CLEARING PM2 PROCESSES..."
    Write-Host "=========================================="
    & $pm2 delete all 2>&1 | Out-Null
    
    Write-Host ""
    Write-Host "2. STARTING NEXT.JS (SMARTDOM) ON PORT 3000..."
    Write-Host "=========================================="
    & $pm2 start "node_modules\\next\\dist\\bin\\next" --name smartdom -- start -p 3000
    & $pm2 save
    
    Write-Host ""
    Write-Host "3. WAITING 3 SECONDS FOR PROCESS TO BOOT..."
    Start-Sleep -Seconds 3
    
    Write-Host ""
    Write-Host "4. PM2 PROCESS LIST:"
    & $pm2 list
    
    Write-Host ""
    Write-Host "5. TCP PORT 3000 STATUS:"
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess
    
    Write-Host ""
    Write-Host "6. HEALTH CHECK (HTTP GET http://localhost:3000):"
    try {
      $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
      Write-Host "✅ Server is ONLINE! Status Code: $($res.StatusCode)"
    } catch {
      Write-Host "❌ Health Check Failed: $($_.Exception.Message)"
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution error:', err);
      conn.end();
      return;
    }
    stream.on('data', (d) => process.stdout.write(d.toString()));
    stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
    stream.on('close', (code) => {
      console.log('\n--- Server restart finished with exit code: ' + code + ' ---');
      conn.end();
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 10000,
  algorithms: {
    kex: [
      'curve25519-sha256',
      'curve25519-sha256@libssh.org',
      'ecdh-sha2-nistp256',
      'ecdh-sha2-nistp384',
      'ecdh-sha2-nistp521',
      'diffie-hellman-group-exchange-sha256',
      'diffie-hellman-group14-sha256',
      'diffie-hellman-group15-sha512',
      'diffie-hellman-group16-sha512',
      'diffie-hellman-group17-sha512',
      'diffie-hellman-group18-sha512',
      'diffie-hellman-group14-sha1',
      'diffie-hellman-group-exchange-sha1',
      'diffie-hellman-group1-sha1'
    ],
    cipher: [
      'chacha20-poly1305@openssh.com',
      'aes128-ctr',
      'aes192-ctr',
      'aes256-ctr',
      'aes128-gcm',
      'aes128-gcm@openssh.com',
      'aes256-gcm',
      'aes256-gcm@openssh.com',
      'aes256-cbc',
      'aes192-cbc',
      'aes128-cbc',
      '3des-cbc'
    ],
    serverHostKey: [
      'ssh-ed25519',
      'ecdsa-sha2-nistp256',
      'ecdsa-sha2-nistp384',
      'ecdsa-sha2-nistp521',
      'rsa-sha2-512',
      'rsa-sha2-256',
      'ssh-rsa',
      'ssh-dss'
    ]
  }
});
