require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const r = await pool.query(`
    SELECT id, name, email, role, primary_role, sub_role 
    FROM users 
    WHERE email IN ('tenant@gmail.com', 'kritsakorn801@gmail.com')
    ORDER BY email
  `);
  console.log('Users:', JSON.stringify(r.rows, null, 2));
  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
