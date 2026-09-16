const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('powershell -Command "Get-ChildItem -Path C:\\kritsakorn\\smartdom\\public\\uploads\\meters -ErrorAction SilentlyContinue | Select-Object Name, Length, LastWriteTime"', (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
