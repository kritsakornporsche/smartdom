const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', async () => {
  const runCmd = (cmd) => new Promise((resolve) => {
    console.log(`\n> ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) {
        console.error('Exec error:', err);
        return resolve();
      }
      stream.on('close', () => resolve())
            .on('data', d => process.stdout.write(d))
            .stderr.on('data', d => process.stderr.write(d));
    });
  });

  // Write run_server.bat properly
  await runCmd(`node -e "
    const fs = require('fs');
    const lines = [
      '@echo off',
      'cd /d C:\\\\kritsakorn\\\\smartdom',
      'set NEXTAUTH_URL=https://smartdorm.phannext.com',
      'set AUTH_URL=https://smartdorm.phannext.com',
      'set AUTH_TRUST_HOST=true',
      'node node_modules\\\\next\\\\dist\\\\bin\\\\next start -p 3000 -H 0.0.0.0'
    ];
    fs.writeFileSync('C:/kritsakorn/smartdom/run_server.bat', lines.join('\\r\\n') + '\\r\\n');
    fs.writeFileSync('C:/kritsakorn/smartdom/start-server.bat', lines.join('\\r\\n') + '\\r\\n');
    console.log('Batch files written successfully');
  "`);

  // Verify content of run_server.bat
  await runCmd('powershell -Command "Get-Content C:\\kritsakorn\\smartdom\\run_server.bat"');

  // Start SmartdomApp3000 (which runs as SYSTEM in background!)
  await runCmd('powershell -Command "Start-ScheduledTask -TaskName SmartdomApp3000; Start-ScheduledTask -TaskName Smartdom3000"');

  // Wait 6 seconds and test port 3000
  await runCmd('powershell -Command "Start-Sleep -Seconds 6; Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess"');

  // Test local HTTP request
  await runCmd('powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 5).StatusCode } catch { $_.Exception.Message }"');

  setTimeout(() => {
    conn.end();
  }, 1000);
});

conn.on('error', (err) => {
  console.error('SSH Error:', err.message);
});

conn.connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 15000,
});
