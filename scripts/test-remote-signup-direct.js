const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    Write-Host "=== 1. CHECKING PORT 3000 & 5993 ==="
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess
    
    Write-Host "=== 2. LOCAL HTTP REQUEST TO SIGNUP API ==="
    try {
      $body = @{
        username = "kritdanai"
        email = "kritdanai@gmail.com"
        password = "testpassword123"
        role = "owner"
      } | ConvertTo-Json
      
      $res = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
      Write-Host "Success response:"
      $res | Format-List
    } catch {
      Write-Host "Signup error on localhost:3000:"
      Write-Host $_.Exception.Message
      if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Body:" $reader.ReadToEnd()
      }
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).on('error', err => {
  if (err.code !== 'ECONNRESET') console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 15000
});
