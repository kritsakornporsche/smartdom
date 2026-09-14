const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    Write-Host "=== 1. WHAT PROCESS WAS PID 6496 (ON 3002)? ==="
    Get-Process -Id 6496 -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, Path, WorkingSet64 -AutoSize
    
    Write-Host ""
    Write-Host "=== 2. IS PORT 3002 STILL LISTENING? ==="
    Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue | Format-Table LocalAddress, LocalPort, State, OwningProcess -AutoSize
    
    Write-Host ""
    Write-Host "=== 3. CHECK WINDOWS FIREWALL RULES FOR PORT 3000 & 3002 ==="
    Get-NetFirewallRule -Direction Inbound -Action Allow -Enabled True | Where-Object { 
      $p = $_ | Get-NetFirewallPortFilter
      $p.LocalPort -match "3000|3002|5993"
    } | Format-Table DisplayName, Name, Enabled, Direction, Action -AutoSize
    
    Write-Host ""
    Write-Host "=== 4. CURRENT IPCONFIG ON SERVER ==="
    Get-NetIPAddress -AddressFamily IPv4 | Format-Table IPAddress, InterfaceAlias -AutoSize
    
    Write-Host ""
    Write-Host "=== 5. CHECK ROUTER PORT FORWARD PROXY (IF ANY) ==="
    netsh interface portproxy show all
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('data', (d) => process.stdout.write(d.toString()));
    stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
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
