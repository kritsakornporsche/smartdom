const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to Remote Server kritsakorn.thddns.net:5995...');

conn.on('ready', () => {
  console.log('✅ SSH Connection established.\n');

  const psScript = `
$ProgressPreference = 'SilentlyContinue'
Write-Output "========================================"
Write-Output "1. SYSTEM SPECIFICATIONS & RESOURCES"
Write-Output "========================================"
$os = Get-CimInstance Win32_OperatingSystem
$usedRam = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory)/1MB, 2)
$totalRam = [math]::Round($os.TotalVisibleMemorySize/1MB, 2)
$freeRamPct = [math]::Round(($os.FreePhysicalMemory/$os.TotalVisibleMemorySize)*100, 1)
Write-Output "OS: $($os.Caption) ($($os.OSArchitecture))"
Write-Output "RAM: $usedRam GB used / $totalRam GB total ($freeRamPct% free)"

$disk = Get-PSDrive C
$usedDisk = [math]::Round($disk.Used/1GB, 2)
$totalDisk = [math]::Round(($disk.Used+$disk.Free)/1GB, 2)
$freeDisk = [math]::Round($disk.Free/1GB, 2)
Write-Output "Disk C: $usedDisk GB used / $totalDisk GB total ($freeDisk GB free)"

Write-Output ""
Write-Output "========================================"
Write-Output "2. DATABASE STATUS (MySQL)"
Write-Output "========================================"
$mysql = Get-Process mysqld -ErrorAction SilentlyContinue
if ($mysql) {
  Write-Output "MySQL Process: Running (PID: $($mysql.Id), RAM: $([math]::Round($mysql.WorkingSet64/1MB, 1)) MB)"
  & "C:\\xampp\\mysql\\bin\\mysql.exe" -u root -e "SHOW DATABASES;"
} else {
  Write-Output "MySQL Process: NOT RUNNING"
}

Write-Output ""
Write-Output "========================================"
Write-Output "3. LISTENING PORTS & SERVICES"
Write-Output "========================================"
$ports = 22, 80, 443, 3000, 3306, 5040, 5993, 5994, 5995
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in $ports } | Select-Object LocalAddress, LocalPort, OwningProcess | Format-Table -AutoSize | Out-String | Write-Output

Write-Output "========================================"
Write-Output "4. NEXT.JS / PM2 APP STATUS"
Write-Output "========================================"
$pm2 = "C:\\Users\\buain\\AppData\\Roaming\\npm\\pm2.cmd"
if (Test-Path $pm2) {
  & $pm2 list | Out-String | Write-Output
} else {
  Write-Output "PM2 not found in AppData"
}

Write-Output "========================================"
Write-Output "5. HTTP ENDPOINT HEALTH CHECK"
Write-Output "========================================"
try {
  $r3 = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 2
  Write-Output "[Port 3000 - SmartDom Next.js App]: ONLINE (HTTP $($r3.StatusCode))"
} catch {
  Write-Output "[Port 3000 - SmartDom Next.js App]: OFFLINE ($($_.Exception.Message))"
}

try {
  $r8 = Invoke-WebRequest -Uri "http://127.0.0.1:80" -UseBasicParsing -TimeoutSec 2
  Write-Output "[Port 80 - Apache Web Server]: ONLINE (HTTP $($r8.StatusCode))"
} catch {
  Write-Output "[Port 80 - Apache Web Server]: OFFLINE ($($_.Exception.Message))"
}
`;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }
    stream.on('data', (d) => {
      // Filter out CLIXML if any
      const str = d.toString();
      if (!str.startsWith('#< CLIXML') && !str.startsWith('<Objs Version=')) {
        process.stdout.write(str);
      }
    });
    stream.stderr.on('data', (d) => {
      const str = d.toString();
      if (!str.startsWith('#< CLIXML') && !str.startsWith('<Objs Version=')) {
        process.stderr.write(str);
      }
    });
    stream.on('close', (code) => {
      console.log('\n========================================');
      console.log('✅ Server Diagnosis Complete (Exit Code: ' + code + ')');
      conn.end();
    });
  });
}).on('error', (err) => {
  console.error('❌ SSH Connection Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 15000,
  algorithms: {
    kex: [
      'curve25519-sha256',
      'curve25519-sha256@libssh.org',
      'ecdh-sha2-nistp256',
      'ecdh-sha2-nistp384',
      'ecdh-sha2-nistp521',
      'diffie-hellman-group-exchange-sha256',
      'diffie-hellman-group14-sha256',
      'diffie-hellman-group15-sha512',
      'diffie-hellman-group16-sha512',
      'diffie-hellman-group17-sha512',
      'diffie-hellman-group18-sha512',
      'diffie-hellman-group14-sha1',
      'diffie-hellman-group-exchange-sha1',
      'diffie-hellman-group1-sha1'
    ],
    cipher: [
      'chacha20-poly1305@openssh.com',
      'aes128-ctr',
      'aes192-ctr',
      'aes256-ctr',
      'aes128-gcm',
      'aes128-gcm@openssh.com',
      'aes256-gcm',
      'aes256-gcm@openssh.com',
      'aes256-cbc',
      'aes192-cbc',
      'aes128-cbc',
      '3des-cbc'
    ],
    serverHostKey: [
      'ssh-ed25519',
      'ecdsa-sha2-nistp256',
      'ecdsa-sha2-nistp384',
      'ecdsa-sha2-nistp521',
      'rsa-sha2-512',
      'rsa-sha2-256',
      'ssh-rsa',
      'ssh-dss'
    ]
  }
});
