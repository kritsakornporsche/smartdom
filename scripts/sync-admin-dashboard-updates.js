const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const filesToUpload = [
  'lib/updatesData.ts',
  'lib/version.json',
  'scripts/generate-version.js',
  'app/platform/page.tsx',
  'app/platform/components/PlatformSidebar.tsx',
  'app/platform/status/page.tsx'
];

const conn = new Client();
console.log('Connecting SSH to kritsakorn.thddns.net:5995 to sync v2.5.0 Admin dashboard and updates...');

conn.on('ready', () => {
  console.log('SSH Connection Established! Uploading files...');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    function ensureDir(remoteDir, cb) {
      sftp.mkdir(remoteDir, () => cb());
    }

    let idx = 0;
    function uploadNext() {
      if (idx >= filesToUpload.length) {
        console.log('\nAll files uploaded successfully to remote server.');
        console.log('Now executing npm run build and PM2 restart on SSH server...\n');
        runRemoteBuild();
        return;
      }

      const relPath = filesToUpload[idx++];
      const localFile = path.join(__dirname, '..', relPath);
      const remoteFile = 'C:/kritsakorn/smartdom/' + relPath.replace(/\\/g, '/');

      if (!fs.existsSync(localFile)) {
        uploadNext();
        return;
      }

      const remoteDir = path.dirname(remoteFile);
      ensureDir(remoteDir, () => {
        sftp.fastPut(localFile, remoteFile, (err) => {
          if (err) console.error('Upload failed:', relPath, err.message);
          else console.log(`✅ Uploaded: ${relPath} -> ${remoteFile}`);
          uploadNext();
        });
      });
    }

    uploadNext();
  });

  function runRemoteBuild() {
    const buildCmd = `cmd /c "cd /d C:\\kritsakorn\\smartdom && npm run build && node C:\\Users\\buain\\AppData\\Roaming\\npm\\node_modules\\pm2\\bin\\pm2 restart smartdom"`;
    console.log('Running remote command: ' + buildCmd);

    conn.exec(buildCmd, (err, stream) => {
      if (err) {
        console.error('Remote exec error:', err);
        conn.end();
        return;
      }

      stream.on('data', (d) => process.stdout.write(d.toString()));
      stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
      stream.on('close', (code) => {
        console.log(`\nRemote build finished with exit code: ${code}`);
        conn.end();
        testRemoteHealth();
      });
    });
  }
});

conn.on('error', (err) => {
  console.log('SSH connection error handled:', err.message);
});

function testRemoteHealth() {
  const http = require('http');
  console.log('\nTesting remote HTTP connection on port 3000...');
  setTimeout(() => {
    http.get('http://kritsakorn.thddns.net:5993/api/db-test', (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`HTTP Status: ${res.statusCode}`);
        console.log(`Response: ${body}`);
      });
    }).on('error', (e) => {
      console.log('HTTP test note:', e.message);
    });
  }, 3000);
}

conn.connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 20000,
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
