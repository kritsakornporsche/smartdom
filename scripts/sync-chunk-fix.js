const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const filesToUpload = [
  'app/layout.tsx',
  'app/error.tsx'
];

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Starting SFTP upload...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    let uploaded = 0;
    for (const relPath of filesToUpload) {
      const localPath = path.join(__dirname, '..', relPath);
      const remotePath = 'C:/kritsakorn/smartdom/' + relPath.replace(/\\/g, '/');
      const content = fs.readFileSync(localPath);

      sftp.writeFile(remotePath, content, (wErr) => {
        if (wErr) console.error(`Error writing ${remotePath}:`, wErr);
        else console.log(`✅ Uploaded: ${relPath}`);
        uploaded++;
        if (uploaded === filesToUpload.length) {
          triggerServerRebuild();
        }
      });
    }
  });

  function triggerServerRebuild() {
    const buildCmd = 'cmd /c "cd /d C:\\kritsakorn\\smartdom && npm.cmd run build && powershell -Command \\"Stop-Process -Name node -Force -ErrorAction SilentlyContinue; Start-Sleep 2; Start-ScheduledTask -TaskName Smartdom3000; Start-Sleep 4; (Invoke-WebRequest -Uri http://127.0.0.1:3000 -UseBasicParsing).StatusCode\\""';
    conn.exec(buildCmd, (err, stream) => {
      if (err) throw err;
      stream.on('data', d => process.stdout.write(d.toString()));
      stream.stderr.on('data', d => process.stderr.write(d.toString()));
      stream.on('close', code => {
        console.log('\nBuild finished with code:', code);
        conn.end();
      });
    });
  }
}).on('error', e => {}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
