const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Testing node http get on localhost:3000...');
  const testCmd = `node -e "const http = require('http'); http.get('http://localhost:3000/api/tenant/billing/qr?billId=3', res => { let d = ''; res.on('data', c => d += c); res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', d)); });"`;
  conn.exec(testCmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', code => {
      console.log('Test output:\n', out);
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
