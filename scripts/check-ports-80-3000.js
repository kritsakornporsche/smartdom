const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Testing all local ports on the server...');

  const psScript = `
    Write-Host "1. TEST HTTP GET http://127.0.0.1:80 (APACHE):"
    try {
      $r80 = Invoke-WebRequest -Uri "http://127.0.0.1:80" -UseBasicParsing -TimeoutSec 3
      Write-Host "Port 80 Status: $($r80.StatusCode)"
    } catch {
      Write-Host "Port 80 Error: $($_.Exception.Message)"
    }
    
    Write-Host ""
    Write-Host "2. TEST HTTP GET http://127.0.0.1:3000 (NEXT.JS):"
    try {
      $r3000 = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 3
      Write-Host "Port 3000 Status: $($r3000.StatusCode)"
    } catch {
      Write-Host "Port 3000 Error: $($_.Exception.Message)"
    }

    Write-Host ""
    Write-Host "3. APACHE HTDOCS OR PROXY:"
    Get-ChildItem -Path "C:\\xampp\\htdocs" -ErrorAction SilentlyContinue | Format-Table Name, Length
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
