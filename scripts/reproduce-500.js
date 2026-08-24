const http = require('http');

(async () => {
  const body = JSON.stringify({ email: 'keeper@kaset2.com', password: 'Password123!' });
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Host': 'kritsakorn.thddns.net:5993',
      'Origin': 'http://kritsakorn.thddns.net:5993',
      'Referer': 'http://kritsakorn.thddns.net:5993/signin',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, res => {
    console.log('Status:', res.statusCode);
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => console.log('Body:', data));
  });

  req.on('error', console.error);
  req.write(body);
  req.end();
})();
