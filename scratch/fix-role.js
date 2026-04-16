const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    await sql`UPDATE users SET role = 'tenant' WHERE email = 'tenant_trial@smartdom.com'`;
    console.log('Role updated to tenant');
  } catch (e) { console.error(e); }
}
run();
