const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testExactSignup() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');
  try {
    const username = 'kritdanai';
    const email = 'kritdanai@gmail.com';
    const password = 'testpassword123';
    const role = 'owner';
    const sub_role = null;

    const cleanEmail = email.toLowerCase().trim();
    const usernameClean = username.trim();
    const usernameNorm = usernameClean.toLowerCase();

    console.log('Checking existing email...');
    const [existingEmail] = await conn.execute('SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1', [cleanEmail]);
    console.log('existingEmail:', existingEmail);

    console.log('Checking existing username...');
    const [existingUsername] = await conn.execute('SELECT id FROM users WHERE LOWER(name) = ? LIMIT 1', [usernameNorm]);
    console.log('existingUsername:', existingUsername);

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Inserting user...');
    const [res] = await conn.execute(
      'INSERT INTO users (name, email, password, role, primary_role, sub_role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [usernameClean, cleanEmail, hashedPassword, role, role, sub_role]
    );
    console.log('Insert success! Result:', res);
    console.log('insertId:', res.insertId);

    // Clean up
    await conn.execute('DELETE FROM users WHERE id = ?', [res.insertId]);
    console.log('Deleted test user');
  } catch (err) {
    console.error('Error during testExactSignup:', err);
  } finally {
    await conn.end();
  }
}

testExactSignup();
