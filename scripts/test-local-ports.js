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

  // Test what port 80 returns on localhost
  await runCmd('powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:80 -UseBasicParsing).RawContent.Substring(0, 300) } catch { $_.Exception.ToString() }"');

  // Also test port 3000
  await runCmd('powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing).RawContent.Substring(0, 300) } catch { $_.Exception.ToString() }"');

  // Also check if there's any other web server or process
  await runCmd('powershell -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 80 -State Listen).OwningProcess | Format-List Id, ProcessName, Path"');

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
