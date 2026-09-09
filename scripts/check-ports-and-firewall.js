const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Checking firewall rules and listening ports...');

  const psScript = `
    Write-Host "1. PORT 3000 NETSTAT:"
    netstat -ano | findstr :3000
    
    Write-Host ""
    Write-Host "2. TEST LOCAL HTTP GET http://127.0.0.1:3000:"
    try {
      $res = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 3
      Write-Host "HTTP Status 127.0.0.1:3000: $($res.StatusCode)"
    } catch {
      Write-Host "Error 127.0.0.1:3000: $($_.Exception.Message)"
    }
    
    Write-Host ""
    Write-Host "3. TEST LOCAL HTTP GET http://192.168.1.104:3000:"
    try {
      $res = Invoke-WebRequest -Uri "http://192.168.1.104:3000" -UseBasicParsing -TimeoutSec 3
      Write-Host "HTTP Status 192.168.1.104:3000: $($res.StatusCode)"
    } catch {
      Write-Host "Error 192.168.1.104:3000: $($_.Exception.Message)"
    }
    
    Write-Host ""
    Write-Host "4. ADDING FIREWALL RULE FOR PORT 3000 (JUST IN CASE):"
    New-NetFirewallRule -DisplayName "SmartDom NextJS 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    Write-Host "Firewall rule created/confirmed."
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
