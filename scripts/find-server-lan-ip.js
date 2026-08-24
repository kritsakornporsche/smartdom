const net = require('net');

const portsToTest = [22, 5995, 3389, 445, 5985, 3306, 3000];

function testPort(ip, port) {
  return new Promise((resolve) => {
    const s = new net.Socket();
    s.setTimeout(600);
    s.on('connect', () => {
      s.destroy();
      resolve(port);
    });
    s.on('timeout', () => { s.destroy(); resolve(null); });
    s.on('error', () => { s.destroy(); resolve(null); });
    s.connect(port, ip);
  });
}

(async () => {
  console.log('Deep scanning LAN for server (192.168.1.1 - 254)...');
  for (let i = 1; i <= 254; i++) {
    const ip = `192.168.1.${i}`;
    if (ip === '192.168.1.46') continue; // skip self

    const openPorts = [];
    for (const p of portsToTest) {
      const ok = await testPort(ip, p);
      if (ok) openPorts.push(ok);
    }

    if (openPorts.length > 0) {
      console.log(`🎯 [DEVICE DETECTED] ${ip}: Open Ports -> [${openPorts.join(', ')}]`);
    }
  }
  console.log('Deep scan complete.');
})();
