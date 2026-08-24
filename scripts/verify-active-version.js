const http = require('http');

async function testEndpoint(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, length: data.length });
      });
    }).on('error', (e) => resolve({ error: e.message }));
  });
}

(async () => {
  console.log('Testing localhost:3000 vs kritsakorn.thddns.net:5993...');
  const localRes = await testEndpoint('http://localhost:3000/');
  const remoteRes = await testEndpoint('http://kritsakorn.thddns.net:5993/');

  console.log('Local (localhost:3000):', localRes);
  console.log('Remote (thddns:5993):', remoteRes);
})();
