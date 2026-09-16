const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const psScript = `
    Get-Process -Id 8072 -ErrorAction SilentlyContinue | Format-List Id, ProcessName, StartTime, Responding, TotalProcessorTime
    Get-Process node -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, StartTime, Responding, WorkingSet -AutoSize
  `;
  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).on('error', err => {
  if (err.code !== 'ECONNRESET') console.error(err);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
