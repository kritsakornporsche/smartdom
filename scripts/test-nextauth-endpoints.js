const http = require('http');

async function test(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Host': 'kritsakorn.thddns.net:5993',
        'Origin': 'http://kritsakorn.thddns.net:5993',
        'Referer': 'http://kritsakorn.thddns.net:5993/signin',
        ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ path, status: res.statusCode, data }));
    });
    req.on('error', e => resolve({ path, error: e.message }));
    if (postData) req.write(postData);
    req.end();
  });
}

(async () => {
  console.log(await test('/api/auth/csrf'));
  console.log(await test('/api/auth/session'));
  console.log(await test('/api/auth/providers'));
})();
