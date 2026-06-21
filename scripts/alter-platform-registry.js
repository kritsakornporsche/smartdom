const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/smartdom_platform');
  try {
    console.log('Altering dormitory_registry table to drop unique index on owner_email...');
    
    // First let's check if the index exists
    const [indexes] = await conn.query("SHOW INDEX FROM dormitory_registry WHERE Column_name = 'owner_email' AND Non_unique = 0");
    if (indexes.length > 0) {
      const indexName = indexes[0].Key_name;
      console.log(`Found unique index: ${indexName}. Dropping it...`);
      await conn.query(`ALTER TABLE dormitory_registry DROP INDEX \`${indexName}\``);
      console.log('✅ Unique index dropped successfully.');
    } else {
      console.log('ℹ️ No unique index found on owner_email.');
    }
  } catch (err) {
    console.error('❌ Error altering table:', err.message);
  } finally {
    await conn.end();
  }
}

run();
