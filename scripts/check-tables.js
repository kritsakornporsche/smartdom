const { Client } = require('ssh2');
const WebSocket = require('ws');

const conn = new Client();
const ws = new WebSocket('wss://172.67.144.197/', {
  headers: { 'Host': 'ssh.phannext.com' },
  servername: 'ssh.phannext.com',
  rejectUnauthorized: false
});

ws.on('open', () => {
  const duplex = WebSocket.createWebSocketStream(ws);
  conn.connect({ sock: duplex, username: 'buain', password: 'Zn@27124700', readyTimeout: 25000 });
});

conn.on('ready', async () => {
  const run = (cmd) => new Promise((res, rej) => {
    const enc = Buffer.from(cmd, 'utf16le').toString('base64');
    conn.exec(`powershell.exe -NoProfile -EncodedCommand ${enc}`, (e, s) => {
      if (e) return rej(e);
      let o = ''; s.on('data', d => o += d); s.stderr.on('data', () => {}); s.on('close', () => res(o));
    });
  });

  const js = `
const m = require('mysql2/promise');
m.createConnection('mysql://smartdom:smartdom@localhost:3306/smartdomdb').then(async db => {
  const [r] = await db.query('SHOW TABLES');
  console.log('TABLES:', JSON.stringify(r.map(t => Object.values(t)[0])));
  db.end();
}).catch(e => console.log('ERR:' + e.message));
`;

  const b64 = Buffer.from(js, 'utf8').toString('base64');
  await run(`[IO.File]::WriteAllText("C:\\\\kritsakorn\\\\smartdom\\\\tt.b64","")`);
  for (let i = 0; i < b64.length; i += 800) {
    await run(`[IO.File]::AppendAllText("C:\\\\kritsakorn\\\\smartdom\\\\tt.b64","${b64.slice(i, i+800)}")`);
  }
  const res = await run(`Set-Location C:\\\\kritsakorn\\\\smartdom; $j=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String([IO.File]::ReadAllText("C:\\\\kritsakorn\\\\smartdom\\\\tt.b64"))); [IO.File]::WriteAllText("C:\\\\kritsakorn\\\\smartdom\\\\tt.js",$j,[Text.Encoding]::UTF8); node tt.js; Remove-Item tt.b64,tt.js -Force -EA SilentlyContinue`);
  console.log(res);
  conn.end(); ws.close();
});

conn.on('error', e => { if (e.code !== 'ECONNRESET') console.error(e.message); });
ws.on('error', e => console.error(e.message));
