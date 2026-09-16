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
      stream.on('close', () => resolve())
            .on('data', d => process.stdout.write(d))
            .stderr.on('data', d => process.stderr.write(d));
    });
  });

  // Check the cloudflared service command line / path
  await runCmd('powershell -Command "Get-CimInstance win32_service -Filter \\"name=\'Cloudflared\'\\" | Select-Object -Property Name, State, PathName | Format-List"');

  conn.end();
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 15000,
});
