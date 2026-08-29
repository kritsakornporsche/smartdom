const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Checking PM2 logs...');
  const pm2Bin = 'C:\\Users\\buain\\AppData\\Roaming\\npm\\node_modules\\pm2\\bin\\pm2';
  conn.exec(`cmd /c "node ${pm2Bin} logs smartdom --lines 30 --nostream"`, (err, stream) => {
    if (err) throw err;
    let d = '';
    stream.on('data', c => d += c);
    stream.on('close', (code) => {
      console.log('PM2 Logs:\n', d);
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
