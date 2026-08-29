const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting SSH to run production Next.js build on server...');

conn.on('ready', () => {
  const buildCmd = 'cmd /c "cd /d C:\\kritsakorn\\smartdom && npm.cmd run build && powershell -Command \\"Stop-Process -Name node -Force -ErrorAction SilentlyContinue; Start-Sleep 2; Start-ScheduledTask -TaskName Smartdom3000; Start-Sleep 4; (Invoke-WebRequest -Uri http://127.0.0.1:3000 -UseBasicParsing).StatusCode\\""';
  
  conn.exec(buildCmd, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('\nBuild & restart complete with code:', code);
      conn.end();
    });
  });
}).on('error', e => {}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
