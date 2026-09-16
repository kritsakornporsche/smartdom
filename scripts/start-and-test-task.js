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

  await runCmd('powershell -Command "Get-Content C:\\kritsakorn\\smartdom\\run_server.bat"');

  // Start Smartdom3000 task
  await runCmd('powershell -Command "Start-ScheduledTask -TaskName Smartdom3000"');

  // Wait 5 seconds
  await runCmd('powershell -Command "Start-Sleep -Seconds 5; Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess"');

  // Test local http
  await runCmd('powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 3).StatusCode } catch { $_.Exception.Message }"');

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
