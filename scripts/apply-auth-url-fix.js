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
      stream.on('close', () => resolve())
            .on('data', d => process.stdout.write(d))
            .stderr.on('data', d => process.stderr.write(d));
    });
  });

  // 1. Update run_server.bat
  const runBat = [
    '@echo off',
    'cd /d C:\\kritsakorn\\smartdom',
    'set NEXTAUTH_URL=https://smartdorm.phannext.com',
    'set AUTH_URL=https://smartdorm.phannext.com',
    'set AUTH_TRUST_HOST=true',
    'npx next start -p 3000 -H 0.0.0.0'
  ].join('\\r\\n');
  await runCmd(`powershell -Command "[IO.File]::WriteAllText('C:\\kritsakorn\\smartdom\\run_server.bat', '${runBat}')"`);

  // 2. Update start-server.bat
  const startBat = [
    '@echo off',
    'cd /d C:\\kritsakorn\\smartdom',
    'set NODE_ENV=production',
    'set PORT=3000',
    'set HOSTNAME=0.0.0.0',
    'set NEXTAUTH_URL=https://smartdorm.phannext.com',
    'set AUTH_URL=https://smartdorm.phannext.com',
    'set AUTH_TRUST_HOST=true',
    'node node_modules\\next\\dist\\bin\\next start -p 3000 -H 0.0.0.0'
  ].join('\\r\\n');
  await runCmd(`powershell -Command "[IO.File]::WriteAllText('C:\\kritsakorn\\smartdom\\start-server.bat', '${startBat}')"`);

  // 3. Update auth.ts fallback in case
  await runCmd(`powershell -Command "$content = Get-Content C:\\kritsakorn\\smartdom\\auth.ts -Raw; $new = $content -replace 'http://kritsakorn.thddns.net:5993', 'https://smartdorm.phannext.com'; [IO.File]::WriteAllText('C:\\kritsakorn\\smartdom\\auth.ts', $new)"`);

  // 4. Kill currently running node process on 3000
  await runCmd('powershell -Command "$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if ($conn) { Stop-Process -Id $conn.OwningProcess -Force }"');

  // 5. Restart Scheduled Task
  await runCmd('powershell -Command "Start-Sleep -Seconds 2; Start-ScheduledTask -TaskName \'Smartdom3000\'"');

  // 6. Wait 4 seconds and check port 3000
  await runCmd('powershell -Command "Start-Sleep -Seconds 4; Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess"');

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
