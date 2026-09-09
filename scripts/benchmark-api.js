const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    $endpoints = @(
      "http://localhost:3000/",
      "http://localhost:3000/explore",
      "http://localhost:3000/api/dorms",
      "http://localhost:3000/api/rooms",
      "http://localhost:3000/api/updates"
    )
    
    Write-Host "================ SPEED BENCHMARK ================"
    foreach ($url in $endpoints) {
      $sw = [System.Diagnostics.Stopwatch]::StartNew()
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing
      $sw.Stop()
      Write-Host "$($r.StatusCode) | $($sw.ElapsedMilliseconds) ms | $url"
    }
  `;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
