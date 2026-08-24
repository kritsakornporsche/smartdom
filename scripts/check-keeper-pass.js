const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.query('SELECT id, name, email, password, role, sub_role, primary_role FROM users WHERE email LIKE "%keeper%" OR email LIKE "%kaset2%"');
  console.log('Users matching keeper/kaset2:');
  for (const u of rows) {
    const isPass123 = await bcrypt.compare('Password123!', u.password || '');
    const isPassPlain = (u.password === 'Password123!');
    console.log(`- ID: ${u.id}, Email: "${u.email}", Name: "${u.name}", Role: "${u.role}", SubRole: "${u.sub_role}", PassHash: "${u.password?.substring(0, 15)}...", Match Password123!: ${isPass123 || isPassPlain}`);
  }
  await conn.end();
})();
