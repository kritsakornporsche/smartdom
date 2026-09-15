const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const filesToUpload = [
  'app/owner/layout.tsx',
  'app/owner/onboarding/page.tsx',
  'app/owner/components/OwnerSidebar.tsx',
  'app/owner/components/OwnerNavbar.tsx',
  'app/owner/components/OwnerChatMessenger.tsx',
  'app/owner/page.tsx',
  'app/owner/rooms/page.tsx',
  'app/owner/tenants/page.tsx',
  'app/owner/meters/page.tsx',
  'app/owner/billing/page.tsx',
  'app/owner/contracts/page.tsx',
  'app/owner/accounting/page.tsx',
  'app/owner/maintenance/page.tsx',
  'app/owner/chat/page.tsx',
  'app/owner/keepers/page.tsx',
  'app/owner/settings/page.tsx',
  'app/api/owner/onboarding/route.ts',
  'app/api/owner/settings/route.ts',
  'app/signup/SignupContent.tsx',
  'app/signin/SigninContent.tsx'
];

const conn = new Client();
console.log('Connecting SSH to deploy owner layout and onboarding fix...');

conn.on('ready', () => {
  console.log('SSH Connection Established! Uploading files via SFTP...');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP Error:', err);
      conn.end();
      return;
    }

    function ensureDir(remoteDir, cb) {
      sftp.mkdir(remoteDir, () => cb());
    }

    let idx = 0;
    function uploadNext() {
      if (idx >= filesToUpload.length) {
        console.log('\nAll owner files uploaded successfully! Now building and restarting server...\n');
        runBuildAndRestart();
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

  function runBuildAndRestart() {
    const psScript = `
      Set-Location "C:\\kritsakorn\\smartdom"
      $env:PATH = "C:\\Program Files\\nodejs;" + $env:PATH
      
      Write-Host "=========================================="
      Write-Host "1. EXECUTING FRESH NPM RUN BUILD..."
      Write-Host "=========================================="
      & "C:\\Program Files\\nodejs\\npm.cmd" run build
      $code = $LASTEXITCODE
      Write-Host "Build exit code: $code"
      if ($code -ne 0) {
        Write-Host "❌ Build failed, aborting restart."
        exit 1
      }
      
      Write-Host ""
      Write-Host "2. RESTARTING SMARTDOM SERVER..."
      Write-Host "=========================================="
      Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
      Start-Sleep -Seconds 2
      Start-ScheduledTask -TaskName "SmartDomServer"
      
      Write-Host ""
      Write-Host "3. WAITING FOR PROCESS TO BOOT..."
      Start-Sleep -Seconds 8
      
      Write-Host ""
      Write-Host "4. TCP PORT 3000 STATUS:"
      Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess -AutoSize
      
      Write-Host ""
      Write-Host "5. HEALTH CHECK (HTTP GET http://localhost:3000):"
      try {
        $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
        Write-Host "✅ Server is ONLINE! HTTP Status: $($res.StatusCode)"
      } catch {
        Write-Host "❌ Health Check Failed: $($_.Exception.Message)"
      }
    `;

    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
      if (err) {
        console.error('Remote execution error:', err);
        conn.end();
        return;
      }
      stream.on('data', (d) => process.stdout.write(d.toString()));
      stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
      stream.on('close', (code) => {
        console.log('\n--- Build and restart completed with code: ' + code + ' ---');
        conn.end();
      });
    });
  }
}).on('error', (err) => {
  if (err.code !== 'ECONNRESET') console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 15000
});
