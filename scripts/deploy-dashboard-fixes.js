const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const filesToUpload = [
  'app/globals.css',
  'components/NotificationsPopover.tsx',
  'app/components/ThemeToggle.tsx',
  'app/components/PromptPayBankSelector.tsx',
  'app/signin/SigninContent.tsx',
  'app/owner/layout.tsx',
  'app/owner/components/OwnerNavbar.tsx',
  'app/owner/components/OwnerSidebar.tsx',
  'app/owner/page.tsx',
  'app/owner/rooms/page.tsx',
  'app/owner/meters/page.tsx',
  'app/tenant/components/TenantSidebar.tsx',
  'app/tenant/billing/page.tsx',
  'app/keeper/components/KeeperSidebar.tsx',
  'app/platform/layout.tsx',
  'app/platform/page.tsx',
  'app/platform/components/PlatformSidebar.tsx',
  'app/researcher/layout.tsx',
  'app/researcher/page.tsx',
  'app/researcher/components/ResearcherNavbar.tsx',
  'app/researcher/components/ResearcherSidebar.tsx',
  'app/researcher/diagrams/page.tsx',
  'app/researcher/sequence/page.tsx',
  'app/sequence/page.tsx',
  'app/researcher/use-cases/page.tsx',
  'app/researcher/er-diagram/page.tsx',
  'app/researcher/updates/page.tsx',
  'app/updates/page.tsx',
  'app/explore/[dormId]/page.tsx',
  'app/explore/room/[id]/page.tsx',
  'app/owner/settings/page.tsx',
  'lib/diagramsData.ts',
  'app/components/MermaidRenderer.tsx',
  'lib/updatesData.ts',
  'daily.md',
  'lib/version.json',
  'package.json',
  'scripts/generate-version.js',
  'app/api/contracts/route.ts',
  'app/api/notifications/route.ts',
  'app/api/owner/bookings/route.ts',
  'app/api/owner/stats/route.ts',
  'app/components/Navbar.tsx',
  'auth.ts',
  'app/api/auth/signup/route.ts',
  'app/api/auth/update-role/route.ts',
  'docs/account.md',
  'ecosystem.config.js',
  'lib/mysql-adapter.js',
  'scripts/switch-db.js',
  'run_lighthouse_flow.js'
];

const conn = new Client();
console.log('Connecting SSH to deploy dashboard updates, theme toggle, signout contrast & signin fix...');

conn.on('ready', () => {
  console.log('SSH Connection Established! Uploading files via SFTP...');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP Error:', err);
      conn.end();
      return;
    }

    function ensureDir(remoteDir, cb) {
      const parts = remoteDir.split('/').filter(Boolean);
      let current = parts[0];
      let i = 1;
      function step() {
        if (i >= parts.length) return cb();
        current += '/' + parts[i++];
        sftp.mkdir(current, () => step());
      }
      step();
    }

    let idx = 0;
    function uploadNext() {
      if (idx >= filesToUpload.length) {
        console.log('\nAll updated files uploaded successfully! Now building and restarting remote server...\n');
        runBuildAndRestart();
        return;
      }

      const relPath = filesToUpload[idx++];
      const localFile = path.join(__dirname, '..', relPath);
      const remoteFile = 'C:/kritsakorn/smartdom/' + relPath.replace(/\\/g, '/');

      console.log(`[${idx}/${filesToUpload.length}] Uploading ${relPath} ...`);
      const remoteDir = path.dirname(remoteFile);
      ensureDir(remoteDir, () => {
        sftp.fastPut(localFile, remoteFile, (uploadErr) => {
          if (uploadErr) {
            console.error(`❌ Failed to upload ${relPath}:`, uploadErr);
          } else {
            console.log(`✅ Uploaded ${relPath}`);
          }
          uploadNext();
        });
      });
    }

    uploadNext();
  });

  function runBuildAndRestart() {
    const psScript = `
      $ErrorActionPreference = 'Continue'
      Set-Location "C:\\kritsakorn\\smartdom"
      Write-Host "1. PULLING/CHECKING ENVIRONMENT:"
      Get-Content "C:\\kritsakorn\\smartdom\\.env.local"
      Write-Host ""
      Write-Host "2. RUNNING NPM RUN BUILD ON REMOTE SERVER:"
      npm run build
      Write-Host ""
      Write-Host "3. RESTARTING SmartDomServer TASK/SERVICE:"
      try {
        Stop-ScheduledTask -TaskName "SmartDomServer" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Start-ScheduledTask -TaskName "SmartDomServer"
        Write-Host "✅ ScheduledTask SmartDomServer Restarted!"
      } catch {
        Write-Host "⚠️ ScheduledTask notice: $($_.Exception.Message)"
      }
      Write-Host ""
      Write-Host "4. WAITING 5 SECONDS FOR SERVER INITIALIZATION..."
      Start-Sleep -Seconds 5
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
        console.log('\n--- Remote build & restart completed with code: ' + code + ' ---');
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
