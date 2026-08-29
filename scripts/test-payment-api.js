(async () => {
  try {
    const testSlip = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const res = await fetch('http://kritsakorn.thddns.net:5993/api/tenant/billing/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billId: 784, slipData: testSlip, email: 'kritsakorn8011@gmail.com' })
    });
    const json = await res.json();
    console.log('Payment API Response:', json);
  } catch (err) {
    console.error('Test error:', err);
  }
})();
