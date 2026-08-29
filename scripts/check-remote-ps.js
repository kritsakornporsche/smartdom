const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to remote SSH server at kritsakorn.thddns.net:5995...');

conn.on('ready', () => {
  console.log('SSH Connection Established!');
  
  const psScript = `
    Write-Host "=== 1. CHECK PORT 3000 LISTENING STATUS ==="
    $p3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($p3000) {
      $p3000 | Format-Table LocalAddress, LocalPort, State, OwningProcess
    } else {
      Write-Host "Port 3000 is NOT listening on the server."
    }

    Write-Host "`n=== 2. ALL LISTENING TCP PORTS ON SERVER ==="
    Get-NetTCPConnection -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess | Sort-Object LocalPort | Format-Table

    Write-Host "`n=== 3. NODE PROCESSES ==="
    Get-Process -Name node -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, Path, StartTime, CPU | Format-Table

    Write-Host "`n=== 4. TEST HTTP GET http://localhost:3000 ==="
    try {
      $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
      Write-Host "HTTP Response Code: $($res.StatusCode)"
    } catch {
      Write-Host "HTTP Request Error: $($_.Exception.Message)"
    }
  `;

  // Encode as base64 to avoid quotes/escaping issues
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
      console.log('\n--- Remote command completed with code: ' + code + ' ---');
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
