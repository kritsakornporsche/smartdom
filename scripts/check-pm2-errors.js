const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Checking PM2 error logs for smartdom...');

  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
    
    Write-Host "PM2 LOGS (ERRORS):"
    & $pm2 logs smartdom --lines 40 --err --nostream
    
    Write-Host ""
    Write-Host "PM2 LOGS (ALL):"
    & $pm2 logs smartdom --lines 40 --nostream
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('\nCompleted with code:', code);
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
