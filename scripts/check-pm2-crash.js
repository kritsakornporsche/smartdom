const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Checking why PM2 smartdom-3000 stopped...');

  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
    
    Write-Host "PM2 LIST:"
    & $pm2 list
    
    Write-Host ""
    Write-Host "PM2 ERROR LOGS (LAST 50 LINES):"
    & $pm2 logs smartdom-3000 --lines 50 --err --nostream
    
    Write-Host ""
    Write-Host "PM2 OUT LOGS (LAST 50 LINES):"
    & $pm2 logs smartdom-3000 --lines 50 --nostream
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('\nLog check completed with code:', code);
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
