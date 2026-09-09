const { Client } = require('ssh2');

const conn = new Client();
conn.on('error', err => {});
conn.on('ready', () => {
  const psCmd = `powershell.exe -NoProfile -Command "Get-Process -Id (Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -ne 3000 } | Select-Object -ExpandProperty OwningProcess -Unique) | Select-Object Id, ProcessName, Path"`;
  conn.exec(psCmd, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
