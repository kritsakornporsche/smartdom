const http = require('http');

console.log('Testing GET http://kritsakorn.thddns.net:5993/...');

const req = http.get('http://kritsakorn.thddns.net:5993/', (res) => {
  console.log('🎉🎉🎉 BINGO! SUCCESS! Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response length:', data.length);
    console.log('HTML Preview:\n', data.substring(0, 300));
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e.message);
});

req.setTimeout(8000, () => {
  console.error('Request Timeout (8s)');
  req.destroy();
});
