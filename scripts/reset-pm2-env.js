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
        console.log(`Exit code: ${code}`);
        resolve();
      })
      .on('data', d => process.stdout.write(d))
      .stderr.on('data', d => process.stderr.write(d));
    });
  });

  // 1. Delete smartdom from pm2
  await runCmd('cmd /c "pm2 delete smartdom || echo ok"');

  // 2. Kill pm2 daemon so cached env is wiped
  await runCmd('cmd /c "pm2 kill"');

  // 3. Start PM2 daemon fresh and start both aio and smartdom with correct env
  await runCmd('cmd /c "cd C:\\kritsakorn\\smartdom && set NEXTAUTH_URL=https://smartdorm.phannext.com && set AUTH_URL=https://smartdorm.phannext.com && set AUTH_TRUST_HOST=true && pm2 start node_modules/next/dist/bin/next --name smartdom -- start -p 3000 -H 0.0.0.0"');

  // Also restore aio-insurance
  await runCmd('cmd /c "pm2 resurrect"');

  // 4. Save PM2
  await runCmd('cmd /c "pm2 save"');

  // 5. List PM2
  await runCmd('cmd /c "pm2 list"');

  setTimeout(() => {
    conn.end();
  }, 2000);
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
