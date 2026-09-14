const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to remote server to install cloudflared...');

conn.on('ready', () => {
  console.log('SSH Connection Established!');
  
  const psScript = `
    $targetDir = "C:\\kritsakorn\\tunnel"
    if (!(Test-Path $targetDir)) {
      New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    $exePath = "$targetDir\\cloudflared.exe"
    if (!(Test-Path $exePath)) {
      Write-Host "Downloading cloudflared.exe..."
      $url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
      curl.exe -L -o $exePath $url
      Write-Host "Download complete!"
    } else {
      Write-Host "cloudflared.exe already exists."
    }
    
    & $exePath --version
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
      console.log('\n--- Setup completed with code: ' + code + ' ---');
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
