const mysql = require('mysql2/promise');
const generatePayload = require('promptpay-qr');
const qrcode = require('qrcode');

async function test() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');
  
  const [bills] = await conn.query('SELECT b.*, t.email as tenant_email, t.dorm_id as tenant_dorm_id FROM bills b LEFT JOIN tenants t ON b.tenant_id = t.id WHERE b.id = 3');
  console.log('Bill 3:', bills);

  const bill = bills[0];
  const dormId = bill.dorm_id || bill.tenant_dorm_id || 1;
  const [profile] = await conn.query('SELECT promptpay_number, dorm_name FROM dormitory_profile WHERE dorm_id = ?', [dormId]);
  console.log('Profile:', profile);

  let promptpayNumber = profile.length > 0 ? profile[0].promptpay_number : null;
  console.log('PromptPay Number:', promptpayNumber);
  
  promptpayNumber = promptpayNumber.replace(/[\s-]/g, '');
  const amount = Number(bill.amount);
  console.log('Amount:', amount);

  const payload = generatePayload(promptpayNumber, { amount });
  console.log('Payload:', payload);

  const qrImage = await qrcode.toDataURL(payload);
  console.log('QR Image length:', qrImage.length);

  await conn.end();
}

test().catch(console.error);
