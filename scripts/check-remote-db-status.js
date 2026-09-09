const { Client } = require('ssh2');

const conn = new Client();
conn.on('error', err => {
  // ignore reset on close
});

conn.on('ready', () => {
  const psCmd = `powershell.exe -NoProfile -Command "Get-Service *mysql*,*mariadb* -ErrorAction SilentlyContinue | Select-Object Name, Status; Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3306, 3307, 3000, 80, 5993 } | Select-Object LocalAddress, LocalPort, OwningProcess"`;
  conn.exec(psCmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => {
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
