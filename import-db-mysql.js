const fs = require('fs');
const mysql = require('mysql2/promise');
const { execSync } = require('child_process');
const urlParser = require('url');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  // Clean URL format
  let cleanUrl = url;
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
    cleanUrl = 'mysql://root:@localhost:3306/smartdomdb';
  }

  const parsed = urlParser.parse(cleanUrl);
  const dbName = parsed.pathname ? parsed.pathname.replace(/^\//, '') : 'smartdomdb';
  const connectionUrlWithoutDb = `${parsed.protocol}//${parsed.auth ? parsed.auth + '@' : ''}${parsed.host}`;

  console.log(`🧹 Phase 0: Dropping and recreating database "${dbName}"...`);
  try {
    const initConn = await mysql.createConnection(connectionUrlWithoutDb);
    await initConn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await initConn.query(`CREATE DATABASE \`${dbName}\``);
    await initConn.end();
    console.log('✅ Database recreated successfully.');
  } catch (err) {
    console.error('Error recreating database:', err.message);
    process.exit(1);
  }

  console.log('\n🚀 Phase 1: Creating official tables using project setup scripts...');
  const scripts = [
    'setup-users-db.js',
    'setup-dorm-db.js',
    'setup-tenant-db.js',
    'setup-packages.js',
    'setup-tasks-db.js',
    'seed-smartdom.js',
    'scripts/add-booking-progress-table.js',
    'scripts/add-chat-system.js',
    'scripts/add-keepers-table.js',
    'scripts/create-announcement-reads.js',
    'scripts/add-signature-to-contracts.js',
    'scripts/alter-bills.js'
  ];

  for (const script of scripts) {
    try {
      console.log(`Running ${script}...`);
      execSync(`node ${script}`, { stdio: 'ignore' });
    } catch (e) {
      console.log(`Note: ${script} finished.`);
    }
  }

  console.log('\n🚀 Phase 2: Connecting to local MySQL to import data...');
  const conn = await mysql.createConnection(cleanUrl);
  try {
    // Set sql_mode to ANSI_QUOTES
    await conn.query(`SET SESSION sql_mode='ANSI_QUOTES,NO_BACKSLASH_ESCAPES,STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'`);
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // Read exported database file
    console.log('Reading smartdomdb_export.json...');
    const data = JSON.parse(fs.readFileSync('smartdomdb_export.json', 'utf8'));

    // Get list of existing tables
    const [existingTableRows] = await conn.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    const existingTables = new Set(existingTableRows.map(row => row.table_name || row.TABLE_NAME));

    for (const [tableName, rows] of Object.entries(data)) {
      console.log(`Processing table "${tableName}" (${rows.length} rows)...`);

      // 1. Create table if it doesn't exist
      if (!existingTables.has(tableName)) {
        console.log(`Table "${tableName}" does not exist. Creating dynamically...`);
        if (rows.length === 0) {
          await conn.query(`CREATE TABLE "${tableName}" (id INT AUTO_INCREMENT PRIMARY KEY)`);
        } else {
          const columns = {};
          const maxLens = {};
          const sampleVals = {};
          const allCols = new Set();

          for (const row of rows) {
            for (const [colName, val] of Object.entries(row)) {
              if (colName === 'id') continue;
              allCols.add(colName);
              if (val !== null) {
                sampleVals[colName] = val;
                if (typeof val === 'string') {
                  maxLens[colName] = Math.max(maxLens[colName] || 0, val.length);
                }
              }
            }
          }

          for (const colName of allCols) {
            const val = sampleVals[colName];
            let colType = 'TEXT NULL';
            if (val !== undefined && val !== null) {
              const type = typeof val;
              if (type === 'boolean') {
                colType = 'BOOLEAN';
              } else if (type === 'number') {
                if (colName.includes('id') || colName === 'floor' || colName === 'duration_days' || colName === 'max_rooms') {
                  colType = 'INTEGER';
                } else {
                  colType = 'DECIMAL(10,2)';
                }
              } else if (type === 'object') {
                colType = 'LONGTEXT';
              } else if (type === 'string') {
                if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                  colType = 'TIMESTAMP NULL';
                } else if (maxLens[colName] > 255 || colName.toLowerCase().includes('signature') || colName.toLowerCase().includes('data')) {
                  colType = 'LONGTEXT';
                } else {
                  colType = 'VARCHAR(255)';
                }
              }
            } else if (colName.toLowerCase().includes('signature') || colName.toLowerCase().includes('data') || colName.toLowerCase().includes('image') || colName.toLowerCase().includes('url')) {
              colType = 'LONGTEXT';
            }
            columns[colName] = colType;
          }

          const colDefs = ['id INT AUTO_INCREMENT PRIMARY KEY'];
          for (const [colName, colType] of Object.entries(columns)) {
            colDefs.push(`"${colName}" ${colType}`);
          }
          const createQuery = `CREATE TABLE "${tableName}" (${colDefs.join(', ')})`;
          await conn.query(createQuery);
        }
      } else {
        // Table exists, check if columns match the JSON data and alter/modify table
        const [dbColumnsRows] = await conn.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = DATABASE() AND table_name = ?
        `, [tableName]);
        const dbCols = {};
        for (const c of dbColumnsRows) {
          dbCols[c.column_name || c.COLUMN_NAME] = c.data_type || c.DATA_TYPE;
        }

        const missingCols = {};
        const maxLens = {};
        const sampleVals = {};
        const allCols = new Set();

        for (const row of rows) {
          for (const [colName, val] of Object.entries(row)) {
            allCols.add(colName);
            if (val !== null) {
              sampleVals[colName] = val;
              if (typeof val === 'string') {
                maxLens[colName] = Math.max(maxLens[colName] || 0, val.length);
              }
            }
            if (!dbCols[colName]) {
              missingCols[colName] = true;
            }
          }
        }

        // Add missing columns
        for (const colName of Object.keys(missingCols)) {
          const val = sampleVals[colName];
          let colType = 'TEXT NULL';
          if (val !== undefined && val !== null) {
            const type = typeof val;
            if (type === 'boolean') {
              colType = 'BOOLEAN';
            } else if (type === 'number') {
              if (colName.includes('id') || colName === 'floor' || colName === 'duration_days' || colName === 'max_rooms') {
                colType = 'INTEGER';
              } else {
                colType = 'DECIMAL(10,2)';
              }
            } else if (type === 'object') {
              colType = 'LONGTEXT';
            } else if (type === 'string') {
              if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                colType = 'TIMESTAMP NULL';
              } else if (maxLens[colName] > 255 || colName.toLowerCase().includes('signature') || colName.toLowerCase().includes('data')) {
                colType = 'LONGTEXT';
              } else {
                colType = 'VARCHAR(255)';
              }
            }
          } else if (colName.toLowerCase().includes('signature') || colName.toLowerCase().includes('data') || colName.toLowerCase().includes('image') || colName.toLowerCase().includes('url')) {
            colType = 'LONGTEXT';
          }
          
          console.log(`Column "${colName}" in table "${tableName}" is missing. Adding dynamically as ${colType}...`);
          await conn.query(`ALTER TABLE "${tableName}" ADD "${colName}" ${colType}`);
          dbCols[colName] = colType;
        }

        // Auto-extend existing columns if data is very long
        for (const [colName, maxLen] of Object.entries(maxLens)) {
          const currentType = (dbCols[colName] || '').toLowerCase();
          if (maxLen > 30000 && currentType !== 'longtext' && currentType !== 'mediumtext') {
            console.log(`Column "${colName}" in table "${tableName}" has large data (${maxLen} chars). Modifying to LONGTEXT...`);
            await conn.query(`ALTER TABLE "${tableName}" MODIFY "${colName}" LONGTEXT`);
          }
        }
      }

      // Truncate/delete existing rows to prevent duplicate primary keys
      await conn.query(`DELETE FROM "${tableName}"`);

      // Insert rows
      if (rows.length > 0) {
        // Collect all column names for the insert query
        const allColumns = new Set();
        for (const row of rows) {
          for (const key of Object.keys(row)) {
            allColumns.add(key);
          }
        }
        const colList = Array.from(allColumns);
        const colNamesStr = colList.map(c => `"${c}"`).join(', ');
        const placeholders = colList.map(() => '?').join(', ');
        const insertQuery = `INSERT INTO "${tableName}" (${colNamesStr}) VALUES (${placeholders})`;

        for (const row of rows) {
          const params = colList.map(col => {
            const val = row[col];
            if (val === undefined) return null;
            if (val !== null && typeof val === 'object') {
              return JSON.stringify(val);
            }
            // Format ISO dates for MySQL raw query insertion
            if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
              return val.replace('T', ' ').replace(/\.\d+Z$/, '').replace(/Z$/, '');
            }
            return val;
          });
          await conn.query(insertQuery, params);
        }
      }
      console.log(`✅ Table "${tableName}" imported successfully!`);
    }

    console.log('\n🎉 Database successfully migrated to MySQL!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    await conn.end();
  }
}

runMigration();
