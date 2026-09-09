const { Client } = require('ssh2');

const conn = new Client();
conn.on('error', () => {});
conn.on('ready', () => {
  const psCmd = `powershell.exe -NoProfile -Command "Get-Content C:\\kritsakorn\\smartdom\\start-server.bat"`;
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
