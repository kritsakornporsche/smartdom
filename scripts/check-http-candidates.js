const http = require('http');

const ips = ['192.168.1.211', '192.168.1.240', '192.168.1.241', '192.168.1.248', '192.168.1.249'];

async function checkHttp(ip) {
  return new Promise((resolve) => {
    const req = http.get(`http://${ip}/`, { timeout: 1000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log(`[${ip}] Status: ${res.statusCode}, Server: ${res.headers.server || 'unknown'}, Title: ${data.substring(0, 100).replace(/\r?\n|\r/g, ' ')}`);
        resolve();
      });
    });
    req.on('error', (e) => {
      console.log(`[${ip}] Error: ${e.message}`);
      resolve();
    });
    req.on('timeout', () => {
      req.destroy();
      console.log(`[${ip}] Timeout`);
      resolve();
    });
  });
}

(async () => {
  for (const ip of ips) {
    await checkHttp(ip);
  }
})();
