async function testApiSignup() {
  const url = 'http://kritsakorn.thddns.net:5993/api/auth/signup';
  console.log('Sending POST to:', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'kritdanai',
        email: 'kritdanai@gmail.com',
        password: 'testpassword123',
        role: 'owner',
      }),
    });
    console.log('HTTP Status:', res.status);
    const data = await res.json();
    console.log('Response body:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testApiSignup();
