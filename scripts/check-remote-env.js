const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Checking remote .env files and database connection configuration...');

  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    Get-ChildItem -Filter "*.env*" -Force | Format-Table Name, Length, LastWriteTime
    
    if (Test-Path ".env.local") {
      Write-Host ".env.local content:"
      Get-Content ".env.local"
    }
    if (Test-Path ".env") {
      Write-Host ".env content:"
      Get-Content ".env"
    }
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
