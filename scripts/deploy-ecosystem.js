const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Uploading ecosystem.config.js and starting with pm2 start ecosystem.config.js ...');

  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('ecosystem.config.js', 'C:/kritsakorn/smartdom/ecosystem.config.js', (err2) => {
      if (err2) throw err2;
      console.log('✅ ecosystem.config.js uploaded to remote server.');

      const pm2Bin = 'C:\\Users\\buain\\AppData\\Roaming\\npm\\node_modules\\pm2\\bin\\pm2';
      const cmd = `cd /d C:\\kritsakorn\\smartdom && node ${pm2Bin} delete all & node ${pm2Bin} start ecosystem.config.js & node ${pm2Bin} save & timeout /t 3 & node ${pm2Bin} list`;

      conn.exec(`cmd /c "${cmd}"`, (err3, stream) => {
        if (err3) throw err3;
        stream.on('data', d => process.stdout.write(d.toString()));
        stream.stderr.on('data', d => process.stderr.write(d.toString()));
        stream.on('close', code => {
          console.log('\nPM2 ecosystem start completed with code:', code);
          conn.end();
        });
      });
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
