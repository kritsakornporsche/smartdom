const http = require('http');

const payload = {
  ownerEmail: 'kritdanai@gmail.com',
  personalData: {
    title: 'นาย',
    firstName: 'กฤษกร',
    lastName: 'บัว',
    fullName: 'นาย กฤษกร บัว',
    idCardNumber: '1100200345678',
    idCardImage: 'สำเนาบัตรประชาชน.jpg',
    registeredAddress: '99/1 ต.แม่กา อ.เมือง จ.พะเยา',
    mobilePhone: '0812345678',
    lineId: '@test',
    emergencyContact: 'นายทดสอบ (บิดา) - 0899999999',
    taxId: '1100200345678'
  },
  dormData: {
    name: 'หอพักทดสอบกฤษกร',
    phone: '0812345678',
    address: 'หน้า ม.พะเยา',
    latitude: '19.0286',
    longitude: '99.8967',
    mapUrl: 'https://maps.google.com/?q=19.0286,99.8967',
    water_rate: 18,
    electricity_rate: 8,
    has_wifi: true,
    has_parking: true,
    pet_friendly: false,
    has_lan: false,
    has_air_con: true,
    selectedAmenities: ['🛏️ เตียงนอน', '❄️ เครื่องปรับอากาศ'],
    facilities: '🛏️ เตียงนอน, ❄️ เครื่องปรับอากาศ'
  }
};

const req = http.request('http://kritsakorn.thddns.net:5993/api/owner/onboarding', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', err => console.error('Request error:', err));
req.write(JSON.stringify(payload));
req.end();
