const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to remote SSH server at kritsakorn.thddns.net:5995...');

conn.on('ready', () => {
  console.log('SSH Connection Established!');
  
  const commands = [
    'echo === [1] LOCAL NETSTAT ON SERVER (PORT 3000) ===',
    'netstat -ano | findstr :3000',
    'echo === [2] ALL LISTENING PORTS ON SERVER ===',
    'netstat -ano | findstr LISTENING',
    'echo === [3] NODE PROCESSES RUNNING ON SERVER ===',
    'tasklist /fi "imagename eq node.exe" /v',
    'echo === [4] PM2 PROCESS LIST ===',
    'npx pm2 list',
    'echo === [5] TEST HTTP GET LOCALHOST:3000 FROM SERVER ===',
    'powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 3).StatusCode } catch { $_.Exception.Message }"',
    'echo === [6] TEST HTTP GET LOCALHOST:5993 FROM SERVER ===',
    'powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:5993 -UseBasicParsing -TimeoutSec 3).StatusCode } catch { $_.Exception.Message }"'
  ].join(' & ');

  conn.exec(`cmd /c "${commands}"`, (err, stream) => {
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
