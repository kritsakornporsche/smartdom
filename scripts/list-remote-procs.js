const { Client } = require('ssh2');

const conn = new Client();
conn.on('error', () => {});
conn.on('ready', () => {
  const psCmd = `powershell.exe -NoProfile -Command "Get-Process | Where-Object { $_.ProcessName -like '*sql*' -or $_.ProcessName -like '*xampp*' -or $_.ProcessName -like '*apache*' -or $_.ProcessName -like '*node*' } | Select-Object Id, ProcessName"`;
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
