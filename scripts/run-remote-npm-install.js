const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected. Running npm install on remote server...');
  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $env:PATH = "C:\\Program Files\\nodejs;" + $env:PATH
    
    Write-Host "Installing missing packages (mermaid, etc.)..."
    & "C:\\Program Files\\nodejs\\npm.cmd" install --no-audit --no-fund
    Write-Host "npm install exit code: $LASTEXITCODE"
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
      console.log('npm install finished with code:', code);
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
