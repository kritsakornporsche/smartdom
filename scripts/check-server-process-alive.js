const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Checking running processes on server...');

  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
    
    Write-Host "1. PM2 STATUS:"
    & $pm2 list
    
    Write-Host ""
    Write-Host "2. NODE PROCESSES:"
    Get-Process -Name node -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, Responding, StartTime
    
    Write-Host ""
    Write-Host "3. PORT 3000 STATUS:"
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('\nProcess check completed with code:', code);
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
