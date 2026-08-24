const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

(async () => {
  console.log('📦 Starting Full Database Export from Local Database...');
  
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'smartdom',
    password: 'smartdom',
    database: 'smartdomdb',
  });

  const [tables] = await conn.query('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
  const tableNames = tables.map(t => Object.values(t)[0]);

  console.log(`Found ${tableNames.length} tables:`, tableNames);

  let sqlOutput = `-- SmartDom Full Database Export\n-- Generated on: ${new Date().toISOString()}\n\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;

  for (const table of tableNames) {
    console.log(`Dumping table: ${table}...`);
    // Drop table & Create Table
    sqlOutput += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    const [createResult] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
    sqlOutput += `${createResult[0]['Create Table']};\n\n`;

    // Dump Data
    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    if (rows.length > 0) {
      const keys = Object.keys(rows[0]).map(k => `\`${k}\``).join(', ');
      sqlOutput += `INSERT INTO \`${table}\` (${keys}) VALUES\n`;
      const valuesArr = rows.map(r => {
        const vals = Object.values(r).map(v => {
          if (v === null) return 'NULL';
          if (typeof v === 'number') return v;
          if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
          if (typeof v === 'boolean') return v ? 1 : 0;
          return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
        });
        return `(${vals.join(', ')})`;
      });
      sqlOutput += valuesArr.join(',\n') + ';\n\n';
    }
  }

  sqlOutput += `SET FOREIGN_KEY_CHECKS = 1;\n`;

  const dumpPath = path.join(__dirname, '..', 'smartdomdb_full_dump.sql');
  const docDumpPath = path.join(__dirname, '..', 'docs', 'smartdomdb_full_dump.sql');

  fs.writeFileSync(dumpPath, sqlOutput, 'utf8');
  fs.writeFileSync(docDumpPath, sqlOutput, 'utf8');

  console.log(`🎉 Full DB Dump saved successfully to:`);
  console.log(`   - ${dumpPath} (${(fs.statSync(dumpPath).size / 1024).toFixed(2)} KB)`);
  console.log(`   - ${docDumpPath}`);

  await conn.end();
})();
