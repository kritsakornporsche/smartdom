const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to SSH server to check PM2 and Port 3000...');

conn.on('ready', () => {
  console.log('Connected! Querying PM2 and Port 3000 status...');

  const psScript = `
    Write-Host "================== PM2 STATUS =================="
    & C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd list
    
    Write-Host ""
    Write-Host "================== PORT 3000 TCP LISTENERS =================="
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess -AutoSize
    
    Write-Host ""
    Write-Host "================== PROCESS ON PORT 3000 =================="
    $conns = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($conns) {
      $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
      Get-Process -Id $pids -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, WorkingSet64, CPU -AutoSize
    } else {
      Write-Host "No process listening on port 3000!"
    }
    
    Write-Host ""
    Write-Host "================== HTTP GET localhost:3000 =================="
    try {
      $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
      Write-Host "HTTP Status Code : " $response.StatusCode
      Write-Host "Content Length   : " $response.RawContentLength "bytes"
      Write-Host "Server Header    : " $response.Headers["Server"]
      Write-Host "X-Powered-By     : " $response.Headers["X-Powered-By"]
      Write-Host "Status           : OK (ONLINE)"
    } catch {
      Write-Host "HTTP Request Failed : " $_.Exception.Message
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
      console.log('\nCheck finished with exit code:', code);
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
  readyTimeout: 10000
});
