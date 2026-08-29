const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const filesToUpload = [
  'app/tenant/billing/page.tsx',
  'app/api/tenant/billing/list/route.ts',
  'app/tenant/page.tsx'
];

const conn = new Client();
console.log('Connecting SSH to sync tenant billing fixes to server...');

conn.on('ready', () => {
  console.log('SSH ready. Starting SFTP upload...');
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

      sftp.writeFile(remotePath, content, (wErr) => {
        if (wErr) {
          console.error(`Error writing ${remotePath}:`, wErr);
        } else {
          console.log(`✅ Uploaded: ${relPath} -> ${remotePath}`);
        }
        uploaded++;
        if (uploaded === filesToUpload.length) {
          console.log('\nAll files uploaded. Rebuilding Next.js and restarting service on server...');
          triggerServerRebuild();
        }
      });
    }
  });

  function triggerServerRebuild() {
    const psScript = `
      Set-Location "C:\\kritsakorn\\smartdom"
      Write-Host "1. Building Next.js..."
      npm run build
      
      Write-Host "2. Restarting Smartdom3000 Scheduled Task..."
      Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
      Start-Sleep -Seconds 2
      Start-ScheduledTask -TaskName "Smartdom3000"
      Start-Sleep -Seconds 4
      
      Write-Host "3. Testing HTTP Health Check on Port 3000..."
      try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ Health Check: HTTP $($r.StatusCode)"
      } catch {
        Write-Host "❌ Health Check: $($_.Exception.Message)"
      }
    `;

    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

    conn.exec(cmd, (err, stream) => {
      if (err) {
        console.error('Build Exec error:', err);
        conn.end();
        return;
      }
      stream.on('data', d => {
        const s = d.toString();
        if (!s.startsWith('#< CLIXML') && !s.startsWith('<Objs Version=')) {
          process.stdout.write(s);
        }
      });
      stream.stderr.on('data', d => {
        const s = d.toString();
        if (!s.startsWith('#< CLIXML') && !s.startsWith('<Objs Version=')) {
          process.stderr.write(s);
        }
      });
      stream.on('close', code => {
        console.log('\n✅ Remote build & task restart finished with code:', code);
        conn.end();
      });
    });
  }
}).on('error', (err) => {
  console.error('SSH Connection Error:', err.message);
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
