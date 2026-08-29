const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const filesToUpload = [
  'app/api/rooms/route.ts',
  'app/api/rooms/[id]/route.ts',
  'app/explore/[dormId]/page.tsx',
  'app/explore/room/[id]/page.tsx',
];

const conn = new Client();

console.log('Connecting SSH to sync updated explore room files...');

conn.on('ready', () => {
  console.log('SSH ready. Starting SFTP...');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    let uploaded = 0;
    for (const relPath of filesToUpload) {
      const localPath = path.join(__dirname, '..', relPath);
      const remotePath = 'C:/kritsakorn/smartdom/' + relPath.replace(/\\/g, '/');
      const content = fs.readFileSync(localPath);

      // Write remote file
      sftp.writeFile(remotePath, content, (wErr) => {
        if (wErr) {
          console.error(`Error writing ${remotePath}:`, wErr);
        } else {
          console.log(`✅ Uploaded: ${relPath} -> ${remotePath}`);
        }
        uploaded++;
        if (uploaded === filesToUpload.length) {
          console.log('\nAll files uploaded. Rebuilding & restarting Next.js on server...');
          triggerServerRebuild();
        }
      });
    }
  });

  function triggerServerRebuild() {
    const cmd = `cmd /c "cd /d C:\\kritsakorn\\smartdom && npm run build && node C:\\Users\\buain\\AppData\\Roaming\\npm\\node_modules\\pm2\\bin\\pm2 restart smartdom"`;
    conn.exec(cmd, (err, stream) => {
      if (err) {
        console.error('Build Exec error:', err);
        conn.end();
        return;
      }
      stream.on('data', d => process.stdout.write(d.toString()));
      stream.stderr.on('data', d => process.stderr.write(d.toString()));
      stream.on('close', code => {
        console.log('\nRemote build & restart finished with code:', code);
        conn.end();
      });
    });
  }
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
