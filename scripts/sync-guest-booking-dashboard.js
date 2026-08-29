const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const filesToUpload = [
  'app/api/booking/qr/route.ts',
  'app/api/booking/cancel/route.ts',
  'app/api/contracts/route.ts',
  'app/api/owner/contracts/route.ts',
  'app/api/owner/bookings/route.ts',
  'app/api/tenant/billing/qr/route.ts',
  'app/api/tenant/billing/payment/route.ts',
  'app/api/tenant/billing/list/route.ts',
  'app/tenant/billing/page.tsx',
  'app/owner/bookings/page.tsx',
  'app/owner/page.tsx',
  'app/owner/components/OwnerSidebar.tsx',
  'app/components/ContractSigner.tsx',
  'app/components/ContractSimulator.tsx',
  'app/explore/room/[id]/page.tsx',
  'app/tenant/page.tsx',
  'app/tenant/layout.tsx',
  'app/tenant/components/CancelBookingButton.tsx',
  'app/owner/contracts/[id]/page.tsx',
  'lib/version.json'
];

const conn = new Client();

console.log('Connecting SSH to sync QR Payment & Slip booking updates to server...');

conn.on('ready', () => {
  console.log('SSH ready. Starting SFTP upload...');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    // Helper to ensure directories exist
    function ensureDir(remoteDir, cb) {
      sftp.mkdir(remoteDir, (err) => {
        // Ignore if exists
        cb();
      });
    }

    let uploaded = 0;
    for (const relPath of filesToUpload) {
      const localPath = path.join(__dirname, '..', relPath);
      const remotePath = 'C:/kritsakorn/smartdom/' + relPath.replace(/\\/g, '/');
      const content = fs.readFileSync(localPath);

      // Create parent dir if needed
      const parentDir = remotePath.substring(0, remotePath.lastIndexOf('/'));
      ensureDir(parentDir, () => {
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
      });
    }
  });

  function triggerServerRebuild() {
    const pm2Bin = 'C:\\Users\\buain\\AppData\\Roaming\\npm\\node_modules\\pm2\\bin\\pm2';
    const cmd = `cmd /c "cd /d C:\\kritsakorn\\smartdom && npm run build && (node ${pm2Bin} restart smartdom || node ${pm2Bin} start node_modules/next/dist/bin/next --name smartdom -- start -p 3000) && node ${pm2Bin} save"`;
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
