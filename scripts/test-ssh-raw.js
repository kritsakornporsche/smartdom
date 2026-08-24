const net = require('net');

console.log('Connecting to kritsakorn.thddns.net:5995 to read SSH banner...');
const client = net.createConnection({ host: 'kritsakorn.thddns.net', port: 5995, timeout: 8000 }, () => {
  console.log('Connected to port 5995! Waiting for SSH banner...');
});

client.on('data', (data) => {
  console.log('Received data from 5995:', data.toString());
});

client.on('error', (err) => {
  console.error('Socket error on 5995:', err.message);
});

client.on('timeout', () => {
  console.error('Socket timeout on 5995');
  client.destroy();
});

client.on('close', () => {
  console.log('Connection to 5995 closed.');
});
