const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH ready. Starting smartdom on 0.0.0.0:3000 via PM2...');
  
  const pm2Bin = 'C:\\Users\\buain\\AppData\\Roaming\\npm\\node_modules\\pm2\\bin\\pm2';
  const startCmd = `cd /d C:\\kritsakorn\\smartdom && node ${pm2Bin} delete all & node ${pm2Bin} start node_modules/next/dist/bin/next --name "smartdom" --cwd "C:\\kritsakorn\\smartdom" -- start -p 3000 -H 0.0.0.0 & node ${pm2Bin} save & timeout /t 3 & node ${pm2Bin} list`;

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
