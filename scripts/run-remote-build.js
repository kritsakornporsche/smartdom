const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected. Running npm run build on remote server...');
  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $env:PATH = "C:\\Program Files\\nodejs;" + $env:PATH
    Write-Host "Node version: $(node -v)"
    Write-Host "NPM version: $(npm -v)"
    
    Write-Host "Running: npm run build"
    & "C:\\Program Files\\nodejs\\npm.cmd" run build
    Write-Host "Build exit code: $LASTEXITCODE"
    
    Write-Host "Checking .next directory:"
    Get-ChildItem "C:\\kritsakorn\\smartdom\\.next" | Select-Object Name, Length, LastWriteTime
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    if (err) {
      console.error(err);
      conn.end();
      return;
    }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('Finished with code:', code);
      conn.end();
    });
  });
}).on('error', err => {
  if (err.code !== 'ECONNRESET') console.error(err);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 20000
});
