const { Client } = require('ssh2');

const token = 'eyJhIjoiODZiYTNmMTcwZTk1ZTdhZDc1YWY3MDA3YmU5YzA3YjUiLCJ0IjoiNTc4MzQ0NTktYTFkZS00ZjBlLWI4Y2YtZTE0NjI2ZmM2YWUwIiwicyI6IlpXRmhZMlJoTVdRdE5UQTVNaTAwTnpkbExUZ3dZbVl0TkdNNFl6azVOakpsT1RsaSJ9';

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

  // 1. Stop service
  await runCmd('powershell -Command "Stop-Service -Name Cloudflared -Force -ErrorAction SilentlyContinue"');

  // 2. Install / update service with new token
  await runCmd(`cmd /c "C:\\kritsakorn\\tunnel\\cloudflared.exe service install ${token}"`);

  // 3. Ensure token file is also updated if needed
  await runCmd(`powershell -Command "[IO.File]::WriteAllText('C:\\ProgramData\\cloudflared\\token', '${token}')"`);

  // 4. Start service
  await runCmd('powershell -Command "Start-Service -Name Cloudflared"');

  // 5. Check status
  await runCmd('powershell -Command "Get-Service -Name Cloudflared"');

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
