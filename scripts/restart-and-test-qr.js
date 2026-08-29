const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Starting Next.js with PowerShell & PM2...');
  
  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
    
    Write-Host "Stopping existing..."
    & $pm2 delete smartdom 2>&1 | Out-Null
    
    Write-Host "Starting smartdom..."
    & $pm2 start "node_modules\\next\\dist\\bin\\next" --name smartdom -- start -p 3000
    & $pm2 save
    
    Start-Sleep -Seconds 3
    Write-Host "PM2 list:"
    & $pm2 list
    
    Write-Host "Port 3000 listening:"
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table
    
    Write-Host "Testing local HTTP request to QR endpoint..."
    try {
      $res = Invoke-RestMethod -Uri "http://localhost:3000/api/tenant/billing/qr?billId=3" -TimeoutSec 5
      Write-Host "✅ QR Endpoint Success: $($res.success)"
      Write-Host "Amount: $($res.amount)"
      Write-Host "PromptPay: $($res.promptpayNumber)"
      Write-Host "Bill: $($res.billTitle)"
    } catch {
      Write-Host "❌ Request Failed: $($_.Exception.Message)"
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('\nFinished with code:', code);
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
