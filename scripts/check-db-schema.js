const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables:', tables.map(t => t.table_name));
    
    if (tables.some(t => t.table_name === 'users')) {
      const cols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
      `;
      console.log('Users columns:', cols.map(c => `${c.column_name} (${c.data_type})`));
    }
  } catch (e) {
    console.error(e);
  }
}
check();
