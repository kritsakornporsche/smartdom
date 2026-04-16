const { neon } = require('@neondatabase/serverless');
const sql = neon("postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require");

async function check() {
  try {
    const user = await sql`SELECT id FROM users WHERE email = 'testowner@test.com'`;
    console.log('USER:', JSON.stringify(user));
  } catch (err) {
    console.error(err);
  }
}

check();
