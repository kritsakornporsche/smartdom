const { Client } = require('ssh2');

const passwords = ['Zn@2714700', 'Zn@27124700'];

async function tryConnect(password) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`✅ Connected successfully with password: ${password}`);
      resolve(conn);
    }).on('error', (err) => {
      reject(err);
    }).connect({
      host: 'kritsakorn.thddns.net',
      port: 5995,
      username: 'buain',
      password: password,
      readyTimeout: 15000,
    });
  });
}

async function run() {
  let conn;
  for (const pw of passwords) {
    try {
      console.log(`Attempting connection with password ${pw}...`);
      conn = await tryConnect(pw);
      break;
    } catch (e) {
      console.log(`Failed with ${pw}: ${e.message}`);
    }
  }

  if (!conn) {
    console.error('❌ Could not connect to remote SSH');
    process.exit(1);
  }

  const commands = [
    'cmd /c "where cloudflared || echo not found"',
    'powershell -Command "Get-Service | Where-Object { $_.Name -like \'*cloudflared*\' }"',
    'cmd /c "netstat -ano | findstr :80"'
  ];

  for (const cmd of commands) {
    console.log(`\n--- Running: ${cmd} ---`);
    await new Promise((resolve) => {
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
  }

  conn.end();
}

run();
