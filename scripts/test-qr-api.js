const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH ready. Testing /api/tenant/billing/qr?billId=3...');
  conn.exec('curl -s http://localhost:3000/api/tenant/billing/qr?billId=3', (err, stream) => {
    if (err) throw err;
    let d = '';
    stream.on('data', c => d += c);
    stream.on('close', (code) => {
      try {
        const json = JSON.parse(d);
        console.log('✅ QR Code API Result:', {
          success: json.success,
          amount: json.amount,
          promptpayNumber: json.promptpayNumber,
          billTitle: json.billTitle,
          dormName: json.dormName,
          hasQrImage: !!json.qrImage
        });
      } catch (e) {
        console.log('Curl output:', d);
      }
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
