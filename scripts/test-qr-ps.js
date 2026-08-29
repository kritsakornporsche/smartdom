const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Testing /api/tenant/billing/qr with PowerShell...');
  conn.exec('powershell -Command "try { $res = Invoke-RestMethod -Uri http://localhost:3000/api/tenant/billing/qr?billId=3; Write-Output ($res | ConvertTo-Json -Depth 2) } catch { Write-Output $_.Exception.Message }"', (err, stream) => {
    if (err) throw err;
    let d = '';
    stream.on('data', c => d += c);
    stream.on('close', (code) => {
      console.log('PowerShell Result:', d);
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
