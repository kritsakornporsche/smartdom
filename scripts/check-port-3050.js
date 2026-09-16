const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', async () => {
  console.log('✅ SSH Connected');

  const runCmd = (cmd) => new Promise((resolve) => {
    console.log(`\n> ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) {
        console.error('Exec error:', err);
        return resolve();
      }
      stream.on('close', (code) => {
        console.log(`Exit code: ${code}`);
        resolve();
      })
      .on('data', d => process.stdout.write(d))
      .stderr.on('data', d => process.stderr.write(d));
    });
  });

  // 1. Check netstat for port 3050
  await runCmd('cmd /c "netstat -ano | findstr :3050"');

  // 2. If listening, check what process is using it
  await runCmd('powershell -Command "Get-NetTCPConnection -LocalPort 3050 -ErrorAction SilentlyContinue | Select-Object LocalAddress, LocalPort, State, OwningProcess | ForEach-Object { $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; [PSCustomObject]@{ LocalAddress=$_.LocalAddress; Port=$_.LocalPort; State=$_.State; PID=$_.OwningProcess; ProcessName=$proc.ProcessName; Path=$proc.Path } } | Format-Table -AutoSize"');

  // 3. Test HTTP curl to localhost:3050
  await runCmd('powershell -Command "try { $res = Invoke-WebRequest -Uri http://localhost:3050 -UseBasicParsing -TimeoutSec 3; Write-Host \'HTTP Status:\' $res.StatusCode } catch { Write-Host \'HTTP Test Result:\' $_.Exception.Message }"');

  setTimeout(() => {
    conn.end();
  }, 1000);
});

conn.on('error', (err) => {
  console.error('SSH Error:', err.message);
});

conn.connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 15000,
});
