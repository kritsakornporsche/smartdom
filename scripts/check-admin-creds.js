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
  // Simple JS that just queries platform_admins table
  const js = `
const m = require('mysql2/promise');
m.createConnection('mysql://smartdom:smartdom@localhost:3306/smartdomdb').then(async db => {
  const [pa] = await db.query('SELECT id, email, password FROM platform_admins LIMIT 5');
  console.log('PLATFORM_ADMINS:', JSON.stringify(pa.map(a=>({id:a.id, email:a.email, pw:a.password}))));
  const [u] = await db.query("SELECT id,email,username,role,password FROM users WHERE role='platform_admin' LIMIT 5");
  console.log('USERS_ADMIN:', JSON.stringify(u.map(a=>({id:a.id,email:a.email,user:a.username,pw:a.password?.slice(0,30)}))));
  db.end();
}).catch(e=>console.log('ERR:'+e.message));
`;
  const b64 = Buffer.from(js,'utf8').toString('base64');
  // Write in chunks
  await run(`[IO.File]::WriteAllText("C:\\\\kritsakorn\\\\smartdom\\\\ck.b64","")`);
  for(let i=0;i<b64.length;i+=800) await run(`[IO.File]::AppendAllText("C:\\\\kritsakorn\\\\smartdom\\\\ck.b64","${b64.slice(i,i+800)}")`);
  const res = await run(`Set-Location C:\\\\kritsakorn\\\\smartdom; $j=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String([IO.File]::ReadAllText("C:\\\\kritsakorn\\\\smartdom\\\\ck.b64"))); [IO.File]::WriteAllText("C:\\\\kritsakorn\\\\smartdom\\\\ck.js",$j,[Text.Encoding]::UTF8); node ck.js; Remove-Item ck.b64,ck.js -Force -EA SilentlyContinue`);
  console.log(res.trim());
  conn.end(); ws.close();
});
conn.on('error', e => { if(e.code!=='ECONNRESET') console.error(e.message); });
ws.on('error', e => console.error(e.message));
