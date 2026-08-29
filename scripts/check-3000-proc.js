const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const ps = `
    Get-NetTCPConnection -LocalPort 3000 | Select-Object LocalPort, OwningProcess, State | Format-Table
    Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Select-Object Id, ProcessName, StartTime, Path | Format-List
  `;
  const encoded = Buffer.from(ps, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).on('error', e => {}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
