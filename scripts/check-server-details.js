const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  const psScript = [
    'Write-Host "=== PROCESS 5240 (Port 80/443) ==="',
    'Get-Process -Id 5240 -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, Path | Format-Table',
    'Write-Host "=== NODE PROCESSES COMMAND LINE ==="',
    'Get-CimInstance Win32_Process -Filter "Name = \'node.exe\'" | Select-Object ProcessId, CommandLine | Format-List',
    'Write-Host "=== DORM APP DIRECTORY ON SERVER ==="',
    'Get-ChildItem -Path "C:\\kritsakorn", "C:\\inetpub" -ErrorAction SilentlyContinue | Select-Object FullName | Format-Table'
  ].join("\r\n");

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
      conn.end();
    });
  });
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
