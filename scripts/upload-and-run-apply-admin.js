const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to SSH to upload and execute apply-admin-user.js...');

conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP Error:', err);
      conn.end();
      return;
    }

    const localFile = path.join(__dirname, 'apply-admin-user.js');
    const remoteFile = 'C:/kritsakorn/smartdom/scripts/apply-admin-user.js';

    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) {
        console.error('Upload Error:', err);
        conn.end();
        return;
      }
      console.log('✅ Uploaded apply-admin-user.js to remote server!');

      conn.exec('cmd /c "cd /d C:\\kritsakorn\\smartdom && node scripts\\apply-admin-user.js"', (err, stream) => {
        if (err) {
          console.error('Exec error:', err);
          conn.end();
          return;
        }
        stream.on('data', d => process.stdout.write(d.toString()));
        stream.stderr.on('data', d => process.stderr.write(d.toString()));
        stream.on('close', code => {
          console.log('Execution finished with code:', code);
          conn.end();
        });
      });
    });
  });
}).on('error', err => {
  console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 10000
});
