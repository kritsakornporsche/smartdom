const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', async () => {
  console.log('✅ SSH Connected');

  const runCmd = (cmd) => new Promise((resolve) => {
    console.log(`\n> ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) {
        console.error('Exec error:', err);
        return resolve();
      }
      stream.on('close', (code) => {
        console.log('Exit code:', code);
        resolve();
      })
      .on('data', d => process.stdout.write(d))
      .stderr.on('data', d => process.stderr.write(d));
    });
  });

  // Write run_server.bat and start-server.bat properly with real newlines via node
  await runCmd(`node -e "
    const fs = require('fs');
    const content = [
      '@echo off',
      'cd /d C:\\\\kritsakorn\\\\smartdom',
      'set NODE_ENV=production',
      'set PORT=3000',
      'set HOSTNAME=0.0.0.0',
      'set NEXTAUTH_URL=https://smartdorm.phannext.com',
      'set AUTH_URL=https://smartdorm.phannext.com',
      'set AUTH_TRUST_HOST=true',
      'node node_modules\\\\next\\\\dist\\\\bin\\\\next start -p 3000 -H 0.0.0.0'
    ].join('\\r\\n');
    fs.writeFileSync('C:/kritsakorn/smartdom/start-server.bat', content);
    fs.writeFileSync('C:/kritsakorn/smartdom/run_server.bat', content);
    console.log('Files written OK');
  "`);

  // Start Scheduled Task SmartDomServer
  await runCmd('powershell -Command "Start-ScheduledTask -TaskName SmartDomServer"');

  // Wait 6 seconds and check port 3000
  await runCmd('powershell -Command "Start-Sleep -Seconds 6; Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess"');

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
