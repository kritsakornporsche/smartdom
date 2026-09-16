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

  const newEnv = [
    'AUTH_SECRET="A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8"',
    'DATABASE_URL="mysql://smartdom:smartdom@localhost:3306/smartdomdb"',
    'AUTH_TRUST_HOST="true"',
    'NEXTAUTH_URL="https://smartdorm.phannext.com"',
    'AUTH_URL="https://smartdorm.phannext.com"'
  ].join('\\r\\n');

  // Update .env.local
  await runCmd(`powershell -Command "[IO.File]::WriteAllText('C:\\kritsakorn\\smartdom\\.env.local', '${newEnv}')"`);

  // Restart smartdom in PM2
  await runCmd('cmd /c "pm2 restart smartdom --update-env || pm2 restart 0 --update-env"');

  // Check pm2 status
  await runCmd('cmd /c "pm2 list"');

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
