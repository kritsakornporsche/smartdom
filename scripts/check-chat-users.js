const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const code = `
    (async () => {
      try {
        const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
        const res = await fetch('http://localhost:3000/api/owner/stats?dormDbName=1');
        const data = await res.json();
        console.log('Stats for dorm 1:', JSON.stringify(data, null, 2));

        const res2 = await fetch('http://localhost:3000/api/owner/stats?dormDbName=10');
        const data2 = await res2.json();
        console.log('Stats for dorm 10:', JSON.stringify(data2, null, 2));
      } catch (err) {
        console.error('API test error:', err);
      }
      process.exit(0);
    })();
  `;
  const b64 = Buffer.from(code).toString('base64');
  conn.exec(`powershell.exe -NoProfile -Command "cd C:\\kritsakorn\\smartdom; node -e \\"eval(Buffer.from('${b64}', 'base64').toString())\\""`, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({ host: 'kritsakorn.thddns.net', port: 5995, username: 'buain', password: 'Zn@27124700' });
