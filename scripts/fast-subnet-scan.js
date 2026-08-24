const net = require('net');

async function scanPortAcrossSubnet(port) {
  const promises = [];
  for (let i = 1; i <= 254; i++) {
    const ip = `192.168.1.${i}`;
    promises.push(new Promise((resolve) => {
      const s = new net.Socket();
      s.setTimeout(400);
      s.on('connect', () => {
        s.destroy();
        resolve(ip);
      });
      s.on('timeout', () => { s.destroy(); resolve(null); });
      s.on('error', () => { s.destroy(); resolve(null); });
      s.connect(port, ip);
    }));
  }
  const results = await Promise.all(promises);
  return results.filter(Boolean);
}

(async () => {
  console.log('Scanning subnet for port 3306 (MySQL)...');
  const mysqlIps = await scanPortAcrossSubnet(3306);
  console.log('MySQL (3306) IPs:', mysqlIps);

  console.log('Scanning subnet for port 22 (SSH)...');
  const sshIps = await scanPortAcrossSubnet(22);
  console.log('SSH (22) IPs:', sshIps);

  console.log('Scanning subnet for port 3000 (Next.js)...');
  const p3000Ips = await scanPortAcrossSubnet(3000);
  console.log('Next.js (3000) IPs:', p3000Ips);

  console.log('Scanning subnet for port 5995...');
  const p5995Ips = await scanPortAcrossSubnet(5995);
  console.log('Port 5995 IPs:', p5995Ips);
})();
