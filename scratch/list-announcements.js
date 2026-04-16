const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const res = await sql`SELECT * FROM announcements LIMIT 1`;
    console.log(res);
  } catch (e) {
    if (e.message.includes('No announcements')) {
      const columns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'announcements'`;
      console.log('Columns:', columns);
    } else {
      console.error(e);
    }
  }
}
run();
