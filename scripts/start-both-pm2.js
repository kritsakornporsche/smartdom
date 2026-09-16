const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  const psScript = `
    $env:PM2_HOME = "C:\\Users\\buain\\.pm2"
    $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
    
    Set-Location "C:\\kritsakorn\\smartdom"
    & $pm2 delete all 2>&1 | Out-Null
    
    # Start smartdom with explicit env
    & $pm2 start "node_modules\\next\\dist\\bin\\next" --name smartdom --cwd "C:\\kritsakorn\\smartdom" --env NEXTAUTH_URL=https://smartdorm.phannext.com --env AUTH_URL=https://smartdorm.phannext.com -- start -p 3000
    
    # Start aio-insurance
    if (Test-Path "C:\\Users\\buain\\Documents\\tset\\AIO-INSURANCE\\server.js") {
      & $pm2 start "C:\\Users\\buain\\Documents\\tset\\AIO-INSURANCE\\server.js" --name aio-insurance --cwd "C:\\Users\\buain\\Documents\\tset\\AIO-INSURANCE"
    }
    
    & $pm2 save
    Start-Sleep -Seconds 3
    & $pm2 list
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('data', (d) => process.stdout.write(d.toString()));
    stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
    stream.on('close', (code) => {
      console.log('PM2 setup exit code:', code);
      conn.end();
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 10000
});
