const http = require('http');

http.get('http://kritsakorn.thddns.net:5993/api/tenant/billing/qr?billId=3', (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('✅ QR API Result:', {
        statusCode: res.statusCode,
        success: json.success,
        amount: json.amount,
        promptpayNumber: json.promptpayNumber,
        billTitle: json.billTitle,
        hasQrImage: !!json.qrImage
      });
    } catch(e) {
      console.log('Response body:', body);
    }
  });
}).on('error', (err) => {
  console.error('Fetch error:', err.message);
});
