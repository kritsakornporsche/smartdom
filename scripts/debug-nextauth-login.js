const http = require('http');

(async () => {
  // Test POST to /api/auth/callback/credentials
  console.log('Testing /api/auth/callback/credentials on kritsakorn.thddns.net:5993...');
  
  const postData = new URLSearchParams({
    email: 'keeper@kaset2.com',
    password: 'Password123!',
    csrfToken: 'mock',
    callbackUrl: 'http://kritsakorn.thddns.net:5993/',
    json: 'true'
  }).toString();

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/callback/credentials',
    method: 'POST',
    headers: {
      'Host': 'kritsakorn.thddns.net:5993',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    console.log('NextAuth Callback Status:', res.statusCode);
    console.log('Headers:', res.headers);
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log('Body:', data);
    });
  });

  req.on('error', console.error);
  req.write(postData);
  req.end();
})();
