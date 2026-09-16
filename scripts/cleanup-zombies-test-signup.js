const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    Write-Host "=== 1. CPU LOAD BEFORE KILLING ZOMBIES ==="
    Get-CimInstance Win32_Processor | Select-Object LoadPercentage
    
    Write-Host "=== 2. KILLING ALL ZOMBIE NODE PROCESSES ==="
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    Write-Host "=== 3. VERIFYING PORT 3000 IS FREE ==="
    $tcp = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($tcp) {
      Write-Host "Port 3000 still occupied by:"
      $tcp | Format-Table
    } else {
      Write-Host "Port 3000 is completely FREE! ✅"
    }
    
    Write-Host "=== 4. STARTING FRESH SMARTDOM SERVER ==="
    Start-ScheduledTask -TaskName "SmartDomServer"
    Start-Sleep -Seconds 6
    
    Write-Host "=== 5. CHECKING NEW LISTENING PROCESS ==="
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess
    
    Write-Host "=== 6. CPU LOAD AFTER CLEANUP ==="
    Get-CimInstance Win32_Processor | Select-Object LoadPercentage
    
    Write-Host "=== 7. TESTING SIGNUP POST REQUEST DIRECTLY ==="
    try {
      $body = @{
        username = "kritdanai"
        email = "kritdanai@gmail.com"
        password = "testpassword123"
        role = "owner"
      } | ConvertTo-Json
      
      $res = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
      Write-Host "✅ SIGNUP SUCCESSFUL:"
      $res | ConvertTo-Json
    } catch {
      Write-Host "❌ Signup still failed: $($_.Exception.Message)"
      if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Response Body:" $reader.ReadToEnd()
      }
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('Cleanup & test finished with code:', code);
      conn.end();
    });
  });
}).on('error', err => {
  if (err.code !== 'ECONNRESET') console.error(err);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
