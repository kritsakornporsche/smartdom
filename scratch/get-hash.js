const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
async function x() {
  const sql = neon(process.env.DATABASE_URL);
  const u = await sql`SELECT email, password FROM users WHERE email = 'guesttotenant@test.com'`;
  if (u.length > 0) {
    console.log('Email:', u[0].email);
    console.log('Password Digest:', u[0].password);
  } else {
    console.log('User not found');
  }
}
x();
