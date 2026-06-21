const mysql = require('mysql2/promise');

async function run() {
  const platformConn = await mysql.createConnection('mysql://root:@localhost:3306/smartdom_platform');
  try {
    const [dorms] = await platformConn.query('SELECT db_name FROM dormitory_registry');
    console.log(`Found ${dorms.length} dorm databases to migrate.`);
    
    for (const dorm of dorms) {
      const dbName = dorm.db_name;
      if (!dbName) continue;
      
      console.log(`Migrating database: ${dbName}...`);
      const conn = await mysql.createConnection(`mysql://root:@localhost:3306/${dbName}`);
      try {
        await conn.query(`SET SESSION sql_mode='ANSI_QUOTES,STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'`);
        
        // Add description
        try {
          await conn.query(`ALTER TABLE dormitory_profile ADD COLUMN description TEXT NULL`);
          console.log(`  Added description to ${dbName}`);
        } catch (e) {
          console.log(`  description column already exists or failed in ${dbName}`);
        }
        
        // Add has_air_con
        try {
          await conn.query(`ALTER TABLE dormitory_profile ADD COLUMN has_air_con BOOLEAN DEFAULT FALSE`);
          console.log(`  Added has_air_con to ${dbName}`);
        } catch (e) {
          console.log(`  has_air_con column already exists or failed in ${dbName}`);
        }

        // Add cover_image
        try {
          await conn.query(`ALTER TABLE dormitory_profile ADD COLUMN cover_image LONGTEXT NULL`);
          console.log(`  Added cover_image to ${dbName}`);
        } catch (e) {
          console.log(`  cover_image column already exists or failed in ${dbName}`);
        }
      } catch (err) {
        console.error(`  Error migrating ${dbName}:`, err.message);
      } finally {
        await conn.end();
      }
    }
    console.log('✅ All migrations completed.');
  } catch (err) {
    console.error('❌ Error during migrations:', err.message);
  } finally {
    await platformConn.end();
  }
}

run();
