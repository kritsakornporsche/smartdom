const { neon } = require('@neondatabase/serverless');
const sql = neon("postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require");

async function check() {
  try {
    const users = await sql`SELECT id, email, name FROM users`;
    console.log('USERS:', JSON.stringify(users));
  } catch (err) {
    console.error(err);
  }
}

check();
