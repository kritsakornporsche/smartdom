const net = require('net');

const arpIps = [
  '192.168.1.13', '192.168.1.19', '192.168.1.23', '192.168.1.26', '192.168.1.36',
  '192.168.1.38', '192.168.1.42', '192.168.1.47', '192.168.1.56', '192.168.1.58',
  '192.168.1.60', '192.168.1.62', '192.168.1.64', '192.168.1.68', '192.168.1.69',
  '192.168.1.80', '192.168.1.83', '192.168.1.87', '192.168.1.94', '192.168.1.96',
  '192.168.1.99', '192.168.1.100', '192.168.1.109', '192.168.1.116', '192.168.1.122',
  '192.168.1.134', '192.168.1.137', '192.168.1.141', '192.168.1.151', '192.168.1.155',
  '192.168.1.172', '192.168.1.177', '192.168.1.178', '192.168.1.179', '192.168.1.180',
  '192.168.1.181', '192.168.1.185', '192.168.1.186', '192.168.1.187', '192.168.1.190',
  '192.168.1.191', '192.168.1.192', '192.168.1.193', '192.168.1.194', '192.168.1.196',
  '192.168.1.197', '192.168.1.198', '192.168.1.211', '192.168.1.240', '192.168.1.241',
  '192.168.1.248', '192.168.1.249'
];

const testPorts = [22, 5995, 3389, 445, 3000, 3306];

function check(ip, port) {
  return new Promise((resolve) => {
    const s = new net.Socket();
    s.setTimeout(300);
    s.on('connect', () => { s.destroy(); resolve(port); });
    s.on('timeout', () => { s.destroy(); resolve(null); });
    s.on('error', () => { s.destroy(); resolve(null); });
    s.connect(port, ip);
  });
}

(async () => {
  console.log(`Scanning ${arpIps.length} active ARP devices in parallel...`);
  await Promise.all(arpIps.map(async (ip) => {
    const results = await Promise.all(testPorts.map(p => check(ip, p)));
    const open = results.filter(Boolean);
    if (open.length > 0) {
      console.log(`🎯 ${ip} -> Open Ports: [${open.join(', ')}]`);
    }
  }));
  console.log('Finished parallel scan.');
})();
