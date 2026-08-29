const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Starting PM2 with next...');
  conn.exec('cd /d C:\\kritsakorn\\smartdom && pm2 delete smartdom || echo ok && pm2 start "node_modules/next/dist/bin/next" --name "smartdom" -- start -p 3000 && pm2 save', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('PM2 restart finished with code:', code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
