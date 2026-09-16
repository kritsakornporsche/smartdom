const { getDb } = require('../lib/db');

async function testSignup() {
  const sql = getDb();
  try {
    console.log('--- 1. DESCRIBE users TABLE ---');
    const cols = await sql`DESCRIBE users`;
    console.log(cols.map(c => `${c.Field} (${c.Type}, Null: ${c.Null}, Default: ${c.Default})`));

    console.log('\n--- 2. TEST SELECT user kritdanai ---');
    const existing = await sql`SELECT * FROM users WHERE name = 'kritdanai' OR email = 'kritdanai@gmail.com'`;
    console.log('Existing users:', existing);

    console.log('\n--- 3. TEST QUERY FROM SIGNUP ROUTE ---');
    const usernameClean = 'kritdanai_test';
    const cleanEmail = 'kritdanai_test@gmail.com';
    const hashedPassword = 'test_hashed_password';
    const chosenRole = 'owner';
    const sub_role = null;

    // Run the exact INSERT from route.ts
    const result = await sql`
      INSERT INTO users (name, email, password, role, primary_role, sub_role, is_active)
      VALUES (
        ${usernameClean},
        ${cleanEmail},
        ${hashedPassword},
        ${chosenRole},
        ${chosenRole},
        ${chosenRole === 'keeper' ? sub_role : null},
        1
      )
    `;
    console.log('Insert result:', result);

    // Clean up test user
    await sql`DELETE FROM users WHERE email = ${cleanEmail}`;
    console.log('Cleaned up test user.');
  } catch (err) {
    console.error('ERROR ENCOUNTERED:', err);
  } finally {
    process.exit(0);
  }
}

testSignup();
