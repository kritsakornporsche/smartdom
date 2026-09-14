const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected. Executing next start in cmd...');
  conn.exec('cmd /c "cd /d C:\\kritsakorn\\smartdom & set PORT=3000 & set HOSTNAME=0.0.0.0 & node node_modules\\next\\dist\\bin\\next start -p 3000 -H 0.0.0.0"', (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('data', d => console.log('STDOUT:', d.toString()));
    stream.stderr.on('data', d => console.log('STDERR:', d.toString()));
    stream.on('close', code => { console.log('Exit code:', code); conn.end(); });
  });
}).on('error', e => console.error('SSH Error:', e.message)).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 10000
});
