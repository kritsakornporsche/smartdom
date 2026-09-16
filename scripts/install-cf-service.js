const { Client } = require('ssh2');

const token = "eyJhIjoiODZiYTNmMTcwZTk1ZTdhZDc1YWY3MDA3YmU5YzA3YjUiLCJ0IjoiNzcwMGEyZWItNTUyNC00MzUyLTkwZDUtNWIzZWRmOTViMzU0IiwicyI6Ik5tWXhNR0prWVRrdE1tWXpPUzAwWVRBNExXSmhNek10TUdWa09HVmtOemN3WVdabCJ9";

const conn = new Client();
console.log('Connecting to remote server to install Cloudflare Tunnel service...');

conn.on('ready', () => {
  const psScript = `
    $tunnelExe = "C:\\kritsakorn\\tunnel\\cloudflared.exe"
    $token = "${token}"
    
    Write-Host "1. STOPPING TEMPORARY TUNNEL PROCESSES & SCHEDULED TASK..."
    Stop-Process -Name "cloudflared" -Force -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName "SmartDomTunnel" -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
    
    Write-Host ""
    Write-Host "2. UNINSTALLING OLD SERVICE IF ANY..."
    & $tunnelExe service uninstall 2>&1 | Out-Null
    
    Write-Host ""
    Write-Host "3. INSTALLING CLOUDFLARE NAMED TUNNEL SERVICE..."
    $installOutput = & $tunnelExe service install $token 2>&1
    Write-Host $installOutput
    
    Write-Host ""
    Write-Host "4. STARTING CLOUDFLARE SERVICE..."
    Start-Sleep -Seconds 2
    Start-Service -Name "Cloudflare Tunnel" -ErrorAction SilentlyContinue | Out-Null
    Start-Service -Name "cloudflared" -ErrorAction SilentlyContinue | Out-Null
    
    Start-Sleep -Seconds 3
    Write-Host ""
    Write-Host "5. CHECKING WINDOWS SERVICE & PROCESS STATUS:"
    Get-Service -Name "*cloudflared*", "*Cloudflare*" -ErrorAction SilentlyContinue | Format-Table Name, Status, StartType -AutoSize
    Get-Process cloudflared -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, WorkingSet -AutoSize
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    if (err) {
      console.error('Remote exec error:', err);
      conn.end();
      return;
    }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('\n--- Service Installation Finished with Code:', code, '---');
      conn.end();
    });
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
