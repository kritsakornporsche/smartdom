const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', async () => {
  console.log('✅ SSH Connected');

  conn.exec('cmd /c "cd C:\\kritsakorn\\smartdom && \"C:\\Program Files\\nodejs\\node.exe\" node_modules\\next\\dist\\bin\\next start -p 3000 -H 0.0.0.0"', (err, stream) => {
    if (err) throw err;
    stream.on('data', d => console.log('STDOUT:', d.toString()));
    stream.stderr.on('data', d => console.error('STDERR:', d.toString()));
    stream.on('close', code => console.log('EXIT:', code));
  });

  setTimeout(() => {
    console.log('Testing curl from inside script...');
    conn.exec('powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing).StatusCode } catch { $_.Exception.Message }"', (err, s) => {
      s.on('data', d => console.log('CURL:', d.toString()));
      s.on('close', () => {
        conn.end();
      });
    });
  }, 4000);
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
