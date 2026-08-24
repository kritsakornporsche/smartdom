/**
 * scripts/add-contract-renewal-cols.js
 * Migration script to ensure contracts table has columns for signed file upload and renewal support.
 */
const mysql = require('mysql2/promise');

const MYSQL_BASE = process.env.DATABASE_URL || 'mysql://smartdom:smartdom@localhost:3306/smartdomdb';

async function migrate() {
  console.log('🔄 Connecting to database for contracts table migration...');
  const pool = mysql.createPool(MYSQL_BASE);

  try {
    // Check and add contract_file_url
    try {
      await pool.query('ALTER TABLE contracts ADD COLUMN contract_file_url LONGTEXT NULL;');
      console.log('✅ Added contract_file_url column to contracts');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ contract_file_url column already exists');
      } else {
        console.log('Notice adding contract_file_url:', e.message);
      }
    }

    // Check and add renewal_requested
    try {
      await pool.query('ALTER TABLE contracts ADD COLUMN renewal_requested TINYINT(1) DEFAULT 0;');
      console.log('✅ Added renewal_requested column to contracts');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ renewal_requested column already exists');
      } else {
        console.log('Notice adding renewal_requested:', e.message);
      }
    }

    // Check and add renewal_note
    try {
      await pool.query('ALTER TABLE contracts ADD COLUMN renewal_note TEXT NULL;');
      console.log('✅ Added renewal_note column to contracts');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ renewal_note column already exists');
      } else {
        console.log('Notice adding renewal_note:', e.message);
      }
    }

    // Check and add parent_contract_id
    try {
      await pool.query('ALTER TABLE contracts ADD COLUMN parent_contract_id INT NULL;');
      console.log('✅ Added parent_contract_id column to contracts');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ parent_contract_id column already exists');
      } else {
        console.log('Notice adding parent_contract_id:', e.message);
      }
    }

    console.log('🎉 Migration completed successfully!');
  } catch (err) {
    console.error('Migration Error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
