const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('✅ SSH Connected');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    const batContent = [
      '@echo off',
      'cd /d C:\\kritsakorn\\smartdom',
      'set NEXTAUTH_URL=https://smartdorm.phannext.com',
      'set AUTH_URL=https://smartdorm.phannext.com',
      'set AUTH_TRUST_HOST=true',
      'node node_modules\\next\\dist\\bin\\next start -p 3000 -H 0.0.0.0',
      ''
    ].join('\r\n');

    sftp.writeFile('C:/kritsakorn/smartdom/run_server.bat', batContent, (err) => {
      if (err) throw err;
      console.log('✅ run_server.bat written via SFTP');

      sftp.writeFile('C:/kritsakorn/smartdom/start-server.bat', batContent, (err) => {
        if (err) throw err;
        console.log('✅ start-server.bat written via SFTP');

        // Start scheduled task
        conn.exec('powershell -Command "Start-ScheduledTask -TaskName Smartdom3000; Start-Sleep -Seconds 5; Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess"', (err, stream) => {
          stream.on('data', d => process.stdout.write(d.toString()));
          stream.on('close', () => {
            conn.end();
          });
        });
      });
    });
  });
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
