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

  // Check scheduled tasks for smartdom or node
  await runCmd('powershell -Command "Get-ScheduledTask | Where-Object { $_.TaskName -like \'*smartdom*\' -or $_.TaskName -like \'*node*\' -or $_.TaskName -like \'*pm2*\' } | Format-Table TaskName, State"');

  // Check windows services
  await runCmd('powershell -Command "Get-Service | Where-Object { $_.Name -like \'*node*\' -or $_.Name -like \'*pm2*\' -or $_.Name -like \'*smartdom*\' } | Format-Table Name, Status, DisplayName"');

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
