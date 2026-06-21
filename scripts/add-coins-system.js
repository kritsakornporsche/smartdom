const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const PLATFORM_DB = 'smartdom_platform';
const MYSQL_URL = 'mysql://root:@localhost:3306';

async function addCoinsSystem() {
  const conn = await mysql.createConnection(`${MYSQL_URL}/${PLATFORM_DB}`);
  await conn.query(`SET SESSION sql_mode='ANSI_QUOTES,STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'`);

  console.log('🚀 Updating platform database for Coin System...');

  // 1. Add coins balance to dormitory_registry
  try {
    await conn.query(`ALTER TABLE dormitory_registry ADD COLUMN coins INT DEFAULT 0`);
    console.log('✅ Added coins column to dormitory_registry');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ coins column already exists');
    } else {
      throw e;
    }
  }

  // 2. Create coin_transactions table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS coin_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dormitory_id INT NOT NULL,
      type ENUM('TopUp','Spend','Refund') NOT NULL,
      amount INT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dormitory_id) REFERENCES dormitory_registry(id)
    )
  `);
  console.log('✅ Created coin_transactions table');

  await conn.end();
  console.log('🎉 Coin system database update complete!');
}

addCoinsSystem().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
