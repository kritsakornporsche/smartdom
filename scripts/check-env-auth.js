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

  // Check .env files in C:\kritsakorn\smartdom
  await runCmd('powershell -Command "Get-ChildItem -Path C:\\kritsakorn\\smartdom -Filter \'.env*\' | Select-Object Name"');

  // Check NEXTAUTH_URL or NEXTAUTH settings in .env
  await runCmd('powershell -Command "Select-String -Path C:\\kritsakorn\\smartdom\\.env* -Pattern \'NEXTAUTH|AUTH\'"');

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
