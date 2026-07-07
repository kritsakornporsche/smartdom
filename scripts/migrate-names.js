const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    // 1. Add columns to users
    console.log('Adding first_name and last_name to users...');
    try {
      await connection.query('ALTER TABLE users ADD COLUMN first_name VARCHAR(128) AFTER password');
      await connection.query('ALTER TABLE users ADD COLUMN last_name VARCHAR(128) AFTER first_name');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Columns already exist in users table.');
      } else {
        throw err;
      }
    }

    // 2. Add columns to platform_admins
    console.log('Adding first_name and last_name to platform_admins...');
    try {
      await connection.query('ALTER TABLE platform_admins ADD COLUMN first_name VARCHAR(128) AFTER password');
      await connection.query('ALTER TABLE platform_admins ADD COLUMN last_name VARCHAR(128) AFTER first_name');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Columns already exist in platform_admins table.');
      } else if (err.code === 'ER_NO_SUCH_TABLE') {
        console.log('Table platform_admins does not exist, skipping.');
      } else {
        throw err;
      }
    }

    // 3. Migrate users data
    console.log('Migrating users data...');
    await connection.query(`
      UPDATE users 
      SET first_name = SUBSTRING_INDEX(name, ' ', 1),
          last_name = TRIM(SUBSTR(name, LOCATE(' ', name)))
      WHERE name LIKE '% %' AND (first_name IS NULL OR first_name = '')
    `);
    await connection.query(`
      UPDATE users 
      SET first_name = name, last_name = ''
      WHERE name NOT LIKE '% %' AND (first_name IS NULL OR first_name = '')
    `);

    // 4. Migrate platform_admins data
    console.log('Migrating platform_admins data...');
    try {
      await connection.query(`
        UPDATE platform_admins 
        SET first_name = SUBSTRING_INDEX(name, ' ', 1),
            last_name = TRIM(SUBSTR(name, LOCATE(' ', name)))
        WHERE name LIKE '% %' AND (first_name IS NULL OR first_name = '')
      `);
      await connection.query(`
        UPDATE platform_admins 
        SET first_name = name, last_name = ''
        WHERE name NOT LIKE '% %' AND (first_name IS NULL OR first_name = '')
      `);
    } catch (err) {
      if (err.code === 'ER_NO_SUCH_TABLE') {
        console.log('Table platform_admins does not exist, skipping data migration.');
      } else {
        throw err;
      }
    }

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

migrate();
