const { Client } = require('ssh2');

const conn = new Client();
console.log('Inspecting SmartDomServer scheduled task...');

conn.on('ready', () => {
  const psScript = `
    $task = Get-ScheduledTask -TaskName "SmartDomServer" -ErrorAction SilentlyContinue
    if ($task) {
      $task | Format-List TaskName, State
      $task.Actions | Format-List
      $task.Principal | Format-List
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
