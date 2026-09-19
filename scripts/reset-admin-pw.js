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
  // Reset platform admin password to known value
  const js = `
const m = require('mysql2/promise');
const bcrypt = require('bcryptjs');
m.createConnection('mysql://smartdom:smartdom@localhost:3306/smartdomdb').then(async db => {
  const newPw = 'Admin@2026';
  const hash = await bcrypt.hash(newPw, 10);
  await db.query('UPDATE platform_admins SET password = ? WHERE email = ?', [hash, 'admin@kaset2.com']);
  console.log('RESET OK: admin@kaset2.com / Admin@2026');
  db.end();
}).catch(e=>console.log('ERR:'+e.message));
`;
  const b64 = Buffer.from(js,'utf8').toString('base64');
  await run(`[IO.File]::WriteAllText("C:\\\\kritsakorn\\\\smartdom\\\\rp.b64","")`);
  for(let i=0;i<b64.length;i+=800) await run(`[IO.File]::AppendAllText("C:\\\\kritsakorn\\\\smartdom\\\\rp.b64","${b64.slice(i,i+800)}")`);
  const res = await run(`Set-Location C:\\\\kritsakorn\\\\smartdom; $j=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String([IO.File]::ReadAllText("C:\\\\kritsakorn\\\\smartdom\\\\rp.b64"))); [IO.File]::WriteAllText("C:\\\\kritsakorn\\\\smartdom\\\\rp.js",$j,[Text.Encoding]::UTF8); node rp.js; Remove-Item rp.b64,rp.js -Force -EA SilentlyContinue`);
  console.log(res.trim());
  conn.end(); ws.close();
});
conn.on('error', e => { if(e.code!=='ECONNRESET') console.error(e.message); });
ws.on('error', e => console.error(e.message));
