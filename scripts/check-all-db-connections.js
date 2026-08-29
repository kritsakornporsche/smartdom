const mysql = require('mysql2/promise');

async function testConnection(label, config) {
  console.log(`\n--------------------------------------------------`);
  console.log(`🔍 Testing Database: ${label}`);
  console.log(`   Host: ${config.host}:${config.port || 3306}, Database: ${config.database}, User: ${config.user}`);
  const startTime = Date.now();
  try {
    const conn = await mysql.createConnection({
      ...config,
      connectTimeout: 5000
    });
    const elapsed = Date.now() - startTime;
    console.log(`✅ Connection SUCCESS in ${elapsed}ms!`);

    // Fetch database name, version, and tables
    const [[ver]] = await conn.query('SELECT VERSION() as version, DATABASE() as current_db');
    console.log(`   MySQL Version: ${ver.version}, Active DB: ${ver.current_db}`);

    const [tables] = await conn.query('SHOW TABLES');
    const tableNames = tables.map(r => Object.values(r)[0]);
    console.log(`   Total Tables: ${tableNames.length}`);
    console.log(`   Tables: ${tableNames.join(', ')}`);

    // Check row counts for primary tables
    const keyTables = ['users', 'dorms', 'rooms', 'bills', 'meters', 'tenants', 'keepers'].filter(t => tableNames.includes(t));
    if (keyTables.length > 0) {
      console.log(`   📊 Sample Row Counts:`);
      for (const t of keyTables) {
        const [[cnt]] = await conn.query(`SELECT COUNT(*) as count FROM \`${t}\``);
        console.log(`      - ${t}: ${cnt.count} rows`);
      }
    }

    await conn.end();
    return { ok: true, label, elapsed, tablesCount: tableNames.length };
  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ Connection FAILED (${elapsed}ms): ${err.message}`);
    return { ok: false, label, error: err.message };
  }
}

(async () => {
  console.log('==================================================');
  console.log('📊 CHECKING DATABASE CONNECTIONS (LOCAL & REMOTE)');
  console.log('==================================================');

  // 1. Local Database
  await testConnection('Local MySQL (localhost:3306)', {
    host: 'localhost',
    port: 3306,
    user: 'smartdom',
    password: 'smartdom',
    database: 'smartdomdb'
  });

  // 2. Remote Database via THDDNS (Port 5994)
  await testConnection('Remote Server MySQL (kritsakorn.thddns.net:5994)', {
    host: 'kritsakorn.thddns.net',
    port: 5994,
    user: 'smartdom',
    password: 'smartdom',
    database: 'smartdomdb'
  });

  // 3. Remote Server MySQL inside Server via SSH (localhost:3306 on server)
  // Let's also check server's internal .env.local on the remote server
})();
