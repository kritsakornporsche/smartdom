const { Client } = require('ssh2');

const conn = new Client();
console.log('Testing Cloudflare Quick Tunnel on remote server...');

conn.on('ready', () => {
  console.log('SSH Connection Established!');
  
  // Run cloudflared for 15 seconds to grab the generated public HTTPS URL
  const psScript = `
    $tunnelExe = "C:\\kritsakorn\\tunnel\\cloudflared.exe"
    $logFile = "C:\\kritsakorn\\tunnel\\tunnel.log"
    
    # Kill any existing cloudflared process
    Stop-Process -Name "cloudflared" -Force -ErrorAction SilentlyContinue
    
    Write-Host "Starting cloudflared tunnel to http://localhost:3000..."
    $proc = Start-Process -FilePath $tunnelExe -ArgumentList "tunnel --url http://localhost:3000" -RedirectStandardError $logFile -PassThru
    
    # Wait for URL to appear in log
    $foundUrl = $null
    for ($i = 0; $i -lt 15; $i++) {
      Start-Sleep -Seconds 1
      if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw
        if ($content -match '(https://[a-zA-Z0-9-]+\\.trycloudflare\\.com)') {
          $foundUrl = $matches[1]
          break
        }
      }
    }
    
    if ($foundUrl) {
      Write-Host "=========================================="
      Write-Host "SUCCESS! PUBLIC HTTPS SSL URL GENERATED:"
      Write-Host $foundUrl
      Write-Host "=========================================="
    } else {
      Write-Host "Log output so far:"
      if (Test-Path $logFile) {
        Get-Content $logFile -Tail 20
      }
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Remote execution error:', err);
      conn.end();
      return;
    }
    stream.on('data', (d) => process.stdout.write(d.toString()));
    stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
    stream.on('close', (code) => {
      console.log('\n--- Test completed with code: ' + code + ' ---');
      conn.end();
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 15000
});
