const net = require('net');

const hosts = [
  '192.168.1.211',
  '192.168.1.240',
  '192.168.1.241',
  '192.168.1.248',
  '192.168.1.249'
];

const ports = [21, 22, 80, 443, 3000, 3001, 3306, 5993, 5994, 5995, 8080, 8443, 2222, 3389];

function test(host, port) {
  return new Promise((resolve) => {
    const s = new net.Socket();
    s.setTimeout(300);
    s.on('connect', () => {
      s.destroy();
      resolve(true);
    });
    s.on('timeout', () => { s.destroy(); resolve(false); });
    s.on('error', () => { s.destroy(); resolve(false); });
    s.connect(port, host);
  });
}

(async () => {
  for (const h of hosts) {
    const openPorts = [];
    for (const p of ports) {
      const ok = await test(h, p);
      if (ok) openPorts.push(p);
    }
    console.log(`Host ${h}:`, openPorts);
  }
})();
