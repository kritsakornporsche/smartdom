const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected. Starting Next.js build and server restart...');
  const psScript = `
    Set-Location "C:\\kritsakorn\\smartdom"
    $env:PATH = "C:\\Program Files\\nodejs;" + $env:PATH
    
    Write-Host "=== 1. RUNNING NPM RUN BUILD ==="
    & "C:\\Program Files\\nodejs\\npm.cmd" run build
    $buildCode = $LASTEXITCODE
    Write-Host "Build exit code: $buildCode"
    
    if ($buildCode -ne 0) {
      Write-Host "❌ Build failed, aborting restart."
      exit 1
    }
    
    Write-Host "=== 2. VERIFYING .next/BUILD_ID ==="
    if (Test-Path "C:\\kritsakorn\\smartdom\\.next\\BUILD_ID") {
      $buildId = Get-Content "C:\\kritsakorn\\smartdom\\.next\\BUILD_ID"
      Write-Host "✅ BUILD_ID found: $buildId"
    } else {
      Write-Host "❌ BUILD_ID not found!"
      exit 1
    }
    
    Write-Host "=== 3. RESTARTING SMARTDOM SERVER SERVICE ==="
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Start-ScheduledTask -TaskName "SmartDomServer"
    
    Write-Host "Waiting 8 seconds for server to initialize..."
    Start-Sleep -Seconds 8
    
    Write-Host "=== 4. CHECKING LISTENING PORTS ==="
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess
    
    Write-Host "=== 5. HTTP GET TEST ==="
    try {
      $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
      Write-Host "✅ Server is ONLINE! Status: $($res.StatusCode)"
    } catch {
      Write-Host "❌ Health check error: $($_.Exception.Message)"
    }

    Write-Host "=== 6. TESTING SIGNUP API DIRECTLY ==="
    try {
      $body = @{
        username = "kritdanai"
        email = "kritdanai@gmail.com"
        password = "testpassword123"
        role = "owner"
      } | ConvertTo-Json
      
      $resSignup = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
      Write-Host "✅ SIGNUP SUCCESS:"
      $resSignup | ConvertTo-Json
    } catch {
      Write-Host "Signup response: $($_.Exception.Message)"
      if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Response Body:" $reader.ReadToEnd()
      }
    }
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
      console.log('\nProcess finished with exit code:', code);
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
