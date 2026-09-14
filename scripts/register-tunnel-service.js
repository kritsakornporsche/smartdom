const { Client } = require('ssh2');

const conn = new Client();
console.log('Setting up persistent Cloudflare Tunnel task on remote server...');

conn.on('ready', () => {
  const psScript = [
    '$tunnelDir = "C:\\kritsakorn\\tunnel"',
    '$batPath = "$tunnelDir\\start-tunnel.bat"',
    '$logPath = "$tunnelDir\\tunnel.log"',
    '$urlPath = "$tunnelDir\\current_url.txt"',
    '$runnerPs = "$tunnelDir\\run-tunnel.ps1"',
    '',
    '$runnerContent = @\'',
    '$tunnelExe = "C:\\kritsakorn\\tunnel\\cloudflared.exe"',
    '$logFile = "C:\\kritsakorn\\tunnel\\tunnel.log"',
    '$urlFile = "C:\\kritsakorn\\tunnel\\current_url.txt"',
    '& $tunnelExe tunnel --url http://localhost:3000 2>&1 | ForEach-Object {',
    '  $_ | Out-File -Append -FilePath $logFile -Encoding utf8',
    '  if ($_ -match "(https://[a-zA-Z0-9-]+\\.trycloudflare\\.com)") {',
    '    $matches[1] | Out-File -FilePath $urlFile -Encoding utf8',
    '  }',
    '}',
    '\'@',
    'Set-Content -Path $runnerPs -Value $runnerContent -Encoding utf8',
    '',
    '$batContent = "@echo off`r`npowershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\\kritsakorn\\tunnel\\run-tunnel.ps1"',
    'Set-Content -Path $batPath -Value $batContent -Encoding utf8',
    '',
    'Write-Host "Registering Scheduled Task: SmartDomTunnel..."',
    'Unregister-ScheduledTask -TaskName "SmartDomTunnel" -Confirm:$false -ErrorAction SilentlyContinue | Out-Null',
    '',
    '$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c C:\\kritsakorn\\tunnel\\start-tunnel.bat"',
    '$trigger = New-ScheduledTaskTrigger -AtStartup',
    '$principal = New-ScheduledTaskPrincipal -UserId "buain" -LogonType Password -RunLevel Limited',
    '',
    'Register-ScheduledTask -TaskName "SmartDomTunnel" -Action $action -Trigger $trigger -Principal $principal -Password "Zn@27124700" -Force | Out-Null',
    '',
    'Write-Host "Starting SmartDomTunnel..."',
    'Start-ScheduledTask -TaskName "SmartDomTunnel"',
    '',
    'Start-Sleep -Seconds 8',
    'if (Test-Path $urlPath) {',
    '  $publicUrl = (Get-Content $urlPath -Raw).Trim()',
    '  Write-Host "=========================================="',
    '  Write-Host "ACTIVE HTTPS SSL URL:"',
    '  Write-Host $publicUrl',
    '  Write-Host "=========================================="',
    '} else {',
    '  Write-Host "Tunnel started, reading log..."',
    '  if (Test-Path $logPath) {',
    '    Get-Content $logPath -Tail 15',
    '  }',
    '}'
  ].join('\r\n');

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
      console.log('\nTask registration finished with code:', code);
      conn.end();
    });
  });
}).on('error', err => {
  if (err.code !== 'ECONNRESET') console.error('SSH error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 15000
});
