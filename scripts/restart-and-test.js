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

  await runCmd('powershell -Command "$env:PM2_HOME=\'C:\\Users\\buain\\.pm2\'; & C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd restart smartdom"');
  await runCmd('powershell -Command "Start-Sleep -Seconds 3; try { (Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 3).StatusCode } catch { $_.Exception.Message }"');

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
