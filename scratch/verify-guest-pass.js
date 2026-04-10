
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function verify() {
  const sql = neon(process.env.DATABASE_URL);
  const user = await sql`SELECT password FROM users WHERE email = 'guesttotenant@test.com' LIMIT 1`;
  
  if (user.length === 0) {
    console.log('User not found');
    return;
  }
  
  const hash = user[0].password;
  const passwordsToTry = ['password123', '12345678', 'smartdom123', 'guest123'];
  
  for (const pw of passwordsToTry) {
    if (bcrypt.compareSync(pw, hash)) {
      console.log(`FOUND MATCH: ${pw}`);
      return;
    }
  }
  console.log('No common password matches');
}

verify();
