const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Checking Apache proxy and Windows portproxy...');

  const psScript = `
    Write-Host "1. WINDOWS PORTPROXY RULES:"
    netsh interface portproxy show all
    
    Write-Host ""
    Write-Host "2. APACHE CONFIG (LOOKING FOR PROXY):"
    Get-ChildItem -Path "C:\\xampp\\apache\\conf" -Recurse -Filter "*.conf" | Select-String -Pattern "ProxyPass|3000" | Select-Object Filename, LineNumber, Line
    
    Write-Host ""
    Write-Host "3. LOCAL CURL TO NEXT.JS HOMEPAGE:"
    (Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing).StatusCode
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
