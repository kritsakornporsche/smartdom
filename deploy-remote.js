const { Client } = require('ssh2');

const conn = new Client();

console.log('🚀 Connecting to Server via SSH to pull latest git changes, build, and restart PM2...');

conn.on('ready', () => {
  console.log('✅ SSH Connected! Pulling git, cleaning .next cache, building & restarting PM2...');
  const cmd = 'cd /d D:\\kritsakorn\\smartdom && git pull origin main && npm install && (npx pm2 stop all || echo ok) && (if exist .next rmdir /s /q .next) && npm run build && npx pm2 startOrReload ecosystem.config.js --update-env && npx pm2 save';
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution Error:', err);
      conn.end();
      return;
    }
    stream.on('close', (code, signal) => {
      console.log(`🎉 Deployment finished with code: ${code}`);
      conn.end();
    }).on('data', (data) => {
      console.log('' + data);
    }).stderr.on('data', (data) => {
      console.error('' + data);
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection Notice/Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'user',
  password: 'Zn@27124700',
  readyTimeout: 30000,
});
