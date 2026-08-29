const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const filesToUpload = [
  'app/api/tenant/billing/list/route.ts',
  'app/error.tsx',
  'app/layout.tsx',
  'app/tenant/billing/page.tsx',
  'app/tenant/page.tsx'
];

const conn = new Client();
console.log('🔄 Connecting to Remote Server to sync files, rebuild Next.js, and restart server...');

conn.on('ready', () => {
  console.log('✅ SSH Connection Established. Uploading files via SFTP...');

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP Error:', err);
      conn.end();
      return;
    }

    let count = 0;
    for (const relPath of filesToUpload) {
      const localPath = path.join(__dirname, '..', relPath);
      const remotePath = 'C:/kritsakorn/smartdom/' + relPath.replace(/\\/g, '/');
      const content = fs.readFileSync(localPath);

      sftp.writeFile(remotePath, content, (wErr) => {
        if (wErr) {
          console.error(`Error uploading ${remotePath}:`, wErr);
        } else {
          console.log(`📤 Uploaded: ${relPath}`);
        }
        count++;
        if (count === filesToUpload.length) {
          console.log('\n📦 All files uploaded. Starting clean build and server restart...');
          runBuildAndRestart();
        }
      });
    }
  });

  function runBuildAndRestart() {
    const buildCmd = 'cmd /c "cd /d C:\\kritsakorn\\smartdom && npm.cmd run build && powershell -Command \\"Write-Host \'Restarting SmartDom service...\'; Stop-Process -Name node -Force -ErrorAction SilentlyContinue; Start-Sleep 2; Start-ScheduledTask -TaskName Smartdom3000; Start-Sleep 5; $res = Invoke-WebRequest -Uri http://127.0.0.1:3000 -UseBasicParsing; Write-Host (\'Server Status: HTTP \' + $res.StatusCode)\\""';

    conn.exec(buildCmd, (err, stream) => {
      if (err) {
        console.error('Exec error:', err);
        conn.end();
        return;
      }
      stream.on('data', d => process.stdout.write(d.toString()));
      stream.stderr.on('data', d => process.stderr.write(d.toString()));
      stream.on('close', code => {
        console.log('\n🎉 Rebuild & Restart finished with code:', code);
        conn.end();
      });
    });
  }
}).on('error', (err) => {
  console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 15000,
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
