const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const target = process.argv[2]?.toLowerCase() || 'remote';

(async () => {
  const isRemote = target === 'remote' || target === 'thddns';
  const config = isRemote ? {
    host: 'kritsakorn.thddns.net',
    port: 5994,
    user: 'smartdom',
    password: 'smartdom',
    database: 'smartdomdb',
    multipleStatements: true,
  } : {
    host: 'localhost',
    port: 3306,
    user: 'smartdom',
    password: 'smartdom',
    database: 'smartdomdb',
    multipleStatements: true,
  };

  console.log(`🚀 Importing smartdomdb_full_dump.sql to ${config.user}@${config.host}:${config.port}/${config.database}...`);

  const dumpPath = path.join(__dirname, '..', 'smartdomdb_full_dump.sql');
  if (!fs.existsSync(dumpPath)) {
    console.error('❌ smartdomdb_full_dump.sql not found');
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(dumpPath, 'utf8');

  try {
    const conn = await mysql.createConnection(config);
    console.log('✅ Connected to target database! Executing SQL statements...');

    // Split and execute chunks
    await conn.query(sqlContent);
    console.log('🎉 Full Database Import Completed Successfully!');

    const [tables] = await conn.query('SHOW TABLES');
    console.log(`✅ Total tables in target DB: ${tables.length}`);
    await conn.end();
  } catch (err) {
    console.error('❌ Import failed:', err.message);
  }
})();
