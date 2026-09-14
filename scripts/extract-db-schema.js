const mysql = require('mysql2/promise');
const fs = require('fs');

(async () => {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/DATABASE_URL="([^"]+)"/);
    const dbUrl = match ? match[1] : 'mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb';
    console.log('Connecting to:', dbUrl.replace(/:[^:@]+@/, ':****@'));
    const conn = await mysql.createConnection(dbUrl);

    const [tables] = await conn.execute('SHOW TABLES');
    const tableNames = tables.map(r => Object.values(r)[0]);
    console.log('Total tables:', tableNames.length);

    const schemaInfo = {};
    for (const tbl of tableNames) {
      const [cols] = await conn.execute(`DESCRIBE ${tbl}`);
      schemaInfo[tbl] = cols.map(c => ({
        Field: c.Field,
        Type: c.Type,
        Null: c.Null,
        Key: c.Key,
        Default: c.Default,
        Extra: c.Extra
      }));
    }

    // Check foreign keys
    const [fks] = await conn.execute(`
      SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'smartdomdb' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    fs.writeFileSync('scratch-db-schema.json', JSON.stringify({ tables: schemaInfo, fks }, null, 2));
    console.log('Foreign keys count:', fks.length);
    console.log('Schema successfully written to scratch-db-schema.json');
    await conn.end();
  } catch (err) {
    console.error('Error extracting DB schema:', err);
    process.exit(1);
  }
})();
