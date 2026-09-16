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
        resolve();
      })
      .on('data', d => process.stdout.write(d))
      .stderr.on('data', d => process.stderr.write(d));
    });
  });

  // Check system environment variables
  await runCmd('powershell -Command "[Environment]::GetEnvironmentVariables(\'Machine\') | Out-String | Select-String 5993"');
  await runCmd('powershell -Command "[Environment]::GetEnvironmentVariables(\'User\') | Out-String | Select-String 5993"');

  // Check pm2 env for smartdom
  await runCmd('powershell -Command "pm2 jlist | ConvertFrom-Json | ForEach-Object { if ($_.name -eq \'smartdom\') { $_.pm2_env.NEXTAUTH_URL; $_.pm2_env.AUTH_URL } }"');

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
