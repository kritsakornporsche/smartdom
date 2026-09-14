const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to remote server kritsakorn.thddns.net:5995...');

conn.on('ready', () => {
  console.log('SSH Connection Established!');
  
  const psScript = `
    Write-Host "=== SYSTEM INFO ==="
    whoami
    Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version | Format-List
    
    Write-Host "=== CHECKING CLOUDFLARED ==="
    Get-Command cloudflared -ErrorAction SilentlyContinue | Format-List Source, Version
    
    Write-Host "=== CHECKING WINGET / CURL ==="
    Get-Command winget -ErrorAction SilentlyContinue | Format-List Source
    Get-Command curl.exe -ErrorAction SilentlyContinue | Format-List Source
    
    Write-Host "=== SCHEDULED TASKS FOR SMARTDOM ==="
    Get-ScheduledTask -TaskName "*smartdom*" -ErrorAction SilentlyContinue | Format-Table TaskName, State
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
      console.log('\n--- Finished with code: ' + code + ' ---');
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
