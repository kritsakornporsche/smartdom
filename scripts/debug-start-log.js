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
        console.log('Exit code:', code);
        resolve();
      })
      .on('data', d => process.stdout.write(d))
      .stderr.on('data', d => process.stderr.write(d));
    });
  });

  // Write start-server.bat with logging
  await runCmd(`node -e "
    const fs = require('fs');
    const content = [
      '@echo off',
      'cd /d C:\\\\kritsakorn\\\\smartdom',
      'set NODE_ENV=production',
      'set PORT=3000',
      'set HOSTNAME=0.0.0.0',
      'set NEXTAUTH_URL=https://smartdorm.phannext.com',
      'set AUTH_URL=https://smartdorm.phannext.com',
      'set AUTH_TRUST_HOST=true',
      '\"C:\\\\Program Files\\\\nodejs\\\\node.exe\" node_modules\\\\next\\\\dist\\\\bin\\\\next start -p 3000 -H 0.0.0.0 > C:\\\\kritsakorn\\\\smartdom\\\\start.log 2>&1'
    ].join('\\r\\n');
    fs.writeFileSync('C:/kritsakorn/smartdom/start-server.bat', content);
  "`);

  // Run it synchronously for 3 seconds to see what it does
  await runCmd('powershell -Command "([wmiclass]\'Win32_Process\').Create(\'cmd.exe /c C:\\kritsakorn\\smartdom\\start-server.bat\'); Start-Sleep -Seconds 3; Get-Content C:\\kritsakorn\\smartdom\\start.log"');

  conn.end();
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
