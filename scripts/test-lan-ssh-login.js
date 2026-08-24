const { Client } = require('ssh2');

const candidateIps = [
  '192.168.1.211',
  '192.168.1.240',
  '192.168.1.241',
  '192.168.1.248',
  '192.168.1.249'
];

async function trySsh(ip) {
  return new Promise((resolve) => {
    const conn = new Client();
    console.log(`Trying SSH to ${ip}:22 ...`);
    
    conn.on('ready', () => {
      console.log(`🎉🎉🎉 SUCCESS! Connected to ${ip}:22 with buain!`);
      conn.exec('cmd /c whoami & hostname & dir C:\\kritsakorn', (err, stream) => {
        if (err) {
          console.error('Exec error:', err);
          conn.end();
          resolve(true);
          return;
        }
        stream.on('data', (d) => console.log(`[${ip}] ` + d));
        stream.on('close', () => {
          conn.end();
          resolve(true);
        });
      });
    }).on('error', (err) => {
      console.log(`❌ ${ip}: ${err.message}`);
      resolve(false);
    }).connect({
      host: ip,
      port: 22,
      username: 'buain',
      password: 'Zn@27124700',
      readyTimeout: 5000,
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
  });
}

(async () => {
  for (const ip of candidateIps) {
    const ok = await trySsh(ip);
    if (ok) break;
  }
})();
