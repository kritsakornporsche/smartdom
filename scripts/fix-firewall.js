const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    Write-Host "=== 1. ALL INBOUND RULES FOR PORT 3000, 3001, 3002 ==="
    Get-NetFirewallPortFilter | Where-Object { $_.LocalPort -in @("3000","3001","3002","5993") } | ForEach-Object {
      $rule = Get-NetFirewallRule -Name $_.InstanceId -ErrorAction SilentlyContinue
      if ($rule) {
        [PSCustomObject]@{
          DisplayName = $rule.DisplayName
          LocalPort   = $_.LocalPort
          Enabled     = $rule.Enabled
          Action      = $rule.Action
        }
      }
    } | Format-Table -AutoSize
    
    Write-Host "=== 2. ADD FIREWALL RULE TO PERMIT PORT 3000 IF MISSING ==="
    New-NetFirewallRule -DisplayName "SmartDom NextJS 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    Write-Host "Rule ensured."
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
