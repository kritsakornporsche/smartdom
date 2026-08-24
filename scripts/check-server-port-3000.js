const http = require('http');
const net = require('net');
const { Client } = require('ssh2');

const host = 'kritsakorn.thddns.net';

function checkTcp(targetHost, port, timeout = 5000) {
  return new Promise((resolve) => {
    const s = new net.Socket();
    s.setTimeout(timeout);
    s.on('connect', () => {
      s.destroy();
      resolve({ port, open: true });
    });
    s.on('timeout', () => { s.destroy(); resolve({ port, open: false, error: 'TIMEOUT' }); });
    s.on('error', (e) => { s.destroy(); resolve({ port, open: false, error: e.message }); });
    s.connect(port, targetHost);
  });
}

function checkHttp(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 6000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ url, statusCode: res.statusCode, length: data.length, title: data.substring(0, 150).replace(/\r?\n|\r/g, ' ') });
      });
    });
    req.on('error', (e) => resolve({ url, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, error: 'TIMEOUT' }); });
  });
}

(async () => {
  console.log(`🔍 [1] Testing External Ports on ${host}...`);
  const r3000 = await checkTcp(host, 3000);
  const r5993 = await checkTcp(host, 5993);
  const r5994 = await checkTcp(host, 5994);
  const r5995 = await checkTcp(host, 5995);

  console.log('Port Check Results:', { r3000, r5993, r5994, r5995 });

  console.log(`\n🔍 [2] Testing HTTP GET on ${host}...`);
  const http5993 = await checkHttp(`http://${host}:5993/`);
  console.log('HTTP 5993 Result:', http5993);

  const http3000 = await checkHttp(`http://${host}:3000/`);
  console.log('HTTP 3000 Result:', http3000);

  console.log(`\n🔍 [3] Connecting SSH to buain@${host}:5995 to inspect Port 3000 inside the server...`);
  const conn = new Client();
  conn.on('ready', () => {
    console.log('✅ SSH Connected to server!');
    const cmd = `cmd /c "netstat -ano | findstr 3000 & npx pm2 list || pm2 list"`;
    conn.exec(cmd, (err, stream) => {
      if (err) {
        console.error('Exec error:', err);
        conn.end();
        return;
      }
      stream.on('data', (d) => console.log('[SERVER STDOUT]:\n' + d));
      stream.stderr.on('data', (d) => console.error('[SERVER STDERR]:\n' + d));
      stream.on('close', (code) => {
        console.log('SSH command finished with code:', code);
        conn.end();
      });
    });
  }).on('error', (err) => {
    console.log('SSH Error:', err.message);
  }).connect({
    host,
    port: 5995,
    username: 'buain',
    password: 'Zn@27124700',
    readyTimeout: 10000,
  });
})();
