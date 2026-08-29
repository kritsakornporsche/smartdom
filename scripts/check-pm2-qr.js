const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Checking PM2 status and curl...');
  conn.exec('pm2 list && curl -s http://localhost:3000/api/tenant/billing/qr?billId=3', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Finished with code:', code);
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
