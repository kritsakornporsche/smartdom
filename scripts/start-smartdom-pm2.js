const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH ready. Starting smartdom via PM2...');
  
  const pm2Bin = 'C:\\Users\\buain\\AppData\\Roaming\\npm\\node_modules\\pm2\\bin\\pm2';
  const startCmd = `cd /d C:\\kritsakorn\\smartdom && node ${pm2Bin} start node_modules/next/dist/bin/next --name "smartdom" -- start -p 3000 && node ${pm2Bin} save`;

  conn.exec(`cmd /c "${startCmd}"`, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }
    stream.on('data', (d) => process.stdout.write(d.toString()));
    stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
    stream.on('close', (code) => {
      console.log('Finished with code:', code);
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 10000
});
