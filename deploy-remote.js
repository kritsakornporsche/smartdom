const { Client } = require('ssh2');

const conn = new Client();

console.log('🚀 Connecting to Server via SSH to pull latest git changes, import database, build, and start server...');

const remoteEnvPath = 'set PATH=C:\\Users\\buain\\AppData\\Local\\OpenAI\\Codex\\runtimes\\cua_node\\f8d2abcb7481383b\\bin;C:\\Users\\buain\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\git\\cmd;C:\\xampp\\mysql\\bin;%PATH%';

conn.on('ready', () => {
  console.log('✅ SSH Connected! Pulling git repo, restoring database, building & starting server...');
  
  const cmd = `cmd /c "${remoteEnvPath} & if not exist C:\\kritsakorn\\smartdom (git clone https://github.com/kritsakornporsche/smartdom.git C:\\kritsakorn\\smartdom) else (cd /d C:\\kritsakorn\\smartdom && git pull origin main) & cd /d C:\\kritsakorn\\smartdom && (npx pm2 delete all || echo clean) && (rmdir /s /q .next || echo clean) && npm run build && npx pm2 start ecosystem.config.js"`;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution Error:', err);
      conn.end();
      return;
    }
    stream.on('close', (code) => {
      console.log(`🎉 Deployment finished with code: ${code}`);
      conn.end();
    }).on('data', (data) => {
      console.log('' + data);
    }).stderr.on('data', (data) => {
      console.error('' + data);
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 30000,
});
