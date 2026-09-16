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

  // Check where 5993 is in .next
  await runCmd('powershell -Command "Select-String -Path C:\\kritsakorn\\smartdom\\.next\\server\\*.js -Pattern \'5993\' | Select-Object Path, LineNumber"');

  // Also check if setting NEXTAUTH_URL in run_server.bat prevents the fallback
  // If run_server.bat has:
  // set NEXTAUTH_URL=https://smartdorm.phannext.com
  // set AUTH_URL=https://smartdorm.phannext.com
  // then !process.env.NEXTAUTH_URL will be FALSE!

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
