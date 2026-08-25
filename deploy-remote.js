const { Client } = require('ssh2');

const conn = new Client();

console.log('🚀 Connecting to Server via SSH to pull latest git changes, import database, build, and start server...');

const remoteEnvPath = 'set PATH=C:\\kritsakorn\\smartdom\\node_modules\\.bin;C:\\Program Files\\nodejs;C:\\Users\\buain\\AppData\\Roaming\\npm;C:\\Users\\buain\\AppData\\Local\\OpenAI\\Codex\\runtimes\\cua_node\\f8d2abcb7481383b\\bin;C:\\Users\\buain\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\git\\cmd;C:\\xampp\\mysql\\bin;%PATH%';

conn.on('ready', () => {
  console.log('✅ SSH Connected! Pulling git repo, restoring database, building & starting server...');
  
  const cmd = `cmd /c "${remoteEnvPath} & if not exist C:\\kritsakorn\\smartdom (git clone https://github.com/kritsakornporsche/smartdom.git C:\\kritsakorn\\smartdom) else (cd /d C:\\kritsakorn\\smartdom && git pull origin main) & cd /d C:\\kritsakorn\\smartdom && (npx pm2 delete smartdom-3001 || echo clean) && (npx pm2 delete smartdom-3000 || echo clean) && (rmdir /s /q .next || echo clean) && npm run build && npx pm2 start ecosystem.config.js & npx pm2 save"`;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution Error:', err);
      conn.end();
      return;
    }
    stream.on('close', (code) => {
      console.log(`🎉 Deployment finished with code: ${code}`);
      conn.end();
    }).on('data', (data) => {
      console.log('' + data);
    }).stderr.on('data', (data) => {
      console.error('' + data);
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 30000,
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
