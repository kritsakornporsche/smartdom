const net = require('net');

const ips = [];
for (let i = 1; i <= 254; i++) {
  ips.push(`192.168.1.${i}`);
}

function checkPort(ip, port, timeout = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isOpened = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      isOpened = true;
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, ip);
  });
}

(async () => {
  console.log('Scanning LAN for SSH (22, 5995) and Web (3000, 5993)...');
  for (const ip of ips) {
    const p22 = await checkPort(ip, 22, 100);
    const p5995 = await checkPort(ip, 5995, 100);
    const p3000 = await checkPort(ip, 3000, 100);
    const p3306 = await checkPort(ip, 3306, 100);
    const p5994 = await checkPort(ip, 5994, 100);

    if (p22 || p5995 || p3000 || p3306 || p5994) {
      console.log(`🎯 FOUND ${ip}:`, { port22: p22, port5995: p5995, port3000: p3000, port3306: p3306, port5994: p5994 });
    }
  }
  console.log('Scan complete.');
})();
