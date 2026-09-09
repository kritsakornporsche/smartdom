const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('PROGRESS.md', 'C:/kritsakorn/smartdom/PROGRESS.md', (err2) => {
      if (err2) throw err2;
      console.log('✅ PROGRESS.md synced to remote server.');
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
