const mysql = require('mysql2/promise');

async function checkUsersSchema() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');
  try {
    const [cols] = await conn.execute('DESCRIBE users');
    console.log('Columns in users table:');
    cols.forEach(c => console.log(`  - ${c.Field} (${c.Type}, Null: ${c.Null}, Default: ${c.Default})`));

    const [rows] = await conn.execute("SELECT id, name, email, role FROM users WHERE name LIKE '%kritdanai%' OR email LIKE '%kritdanai%'");
    console.log('\nUsers matching kritdanai:', rows);
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await conn.end();
  }
}

checkUsersSchema();
