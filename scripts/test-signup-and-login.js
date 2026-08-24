const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

(async () => {
  const testEmail = `newuser_${Date.now()}@example.com`;
  const testUsername = `user_${Date.now()}`;
  const testPassword = 'Password123!';

  console.log('🧪 [1] Testing Registration (POST /api/auth/signup)...');
  console.log(`Email: ${testEmail}, Username: ${testUsername}, Role: owner`);

  const signupRes = await request('POST', '/api/auth/signup', {
    username: testUsername,
    email: testEmail,
    password: testPassword,
    role: 'owner'
  });

  console.log('Signup Response:', signupRes);

  if (!signupRes.data.success) {
    console.error('❌ Signup Failed!');
    return;
  }
  console.log('✅ Signup Passed!');

  console.log('\n🧪 [2] Testing Login with Email (POST /api/auth/login)...');
  const loginEmailRes = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: testPassword
  });
  console.log('Login by Email Response:', loginEmailRes);

  console.log('\n🧪 [3] Testing Login with Username (POST /api/auth/login)...');
  const loginUserRes = await request('POST', '/api/auth/login', {
    email: testUsername,
    password: testPassword
  });
  console.log('Login by Username Response:', loginUserRes);

  console.log('\n🧪 [4] Testing Duplicate Email Check (GET /api/auth/signup?email=...)...');
  const dupEmailRes = await request('GET', `/api/auth/signup?email=${testEmail}`);
  console.log('Duplicate Email Check Response:', dupEmailRes);

  console.log('\n🎉 ALL REGISTRATION & LOGIN CHECKS COMPLETED!');
})();
