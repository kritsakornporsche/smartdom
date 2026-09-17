const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('cmd.exe /c "type C:\\kritsakorn\\smartdom\\diag.log"', (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString('utf16le')));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => { conn.end(); process.exit(0); });
  });
}).connect({ host: 'kritsakorn.thddns.net', port: 5995, username: 'buain', password: 'Zn@27124700' });
