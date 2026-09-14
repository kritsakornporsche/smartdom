const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Ready. Checking XAMPP MySQL...');
  const script = `
    if (Test-Path "C:\\xampp\\mysql_start.bat") {
      Write-Host "Found C:\\xampp\\mysql_start.bat, launching..."
      Start-Process "C:\\xampp\\mysql_start.bat" -WindowStyle Hidden
      Start-Sleep 3
    } elseif (Test-Path "C:\\xampp\\mysql\\bin\\mysqld.exe") {
      Write-Host "Starting mysqld.exe directly..."
      Start-Process "C:\\xampp\\mysql\\bin\\mysqld.exe" -ArgumentList "--defaults-file=C:\\xampp\\mysql\\bin\\my.ini" -WindowStyle Hidden
      Start-Sleep 3
    }
    netstat -ano | findstr 3306
  `;
  const encoded = Buffer.from(script, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => {
      console.log('Done.');
      conn.end();
    });
  });
}).on('error', err => {
  console.log('SSH Error handled:', err.message);
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
