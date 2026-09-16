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

  // Search C:\kritsakorn\smartdom for 5993
  await runCmd('powershell -Command "Select-String -Path C:\\kritsakorn\\smartdom\\* -Pattern \'5993\' -Exclude \'node_modules\', \'.next\'"');
  await runCmd('powershell -Command "Select-String -Path C:\\kritsakorn\\smartdom\\.next\\required-server-files.json -Pattern \'5993\' -ErrorAction SilentlyContinue"');

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
