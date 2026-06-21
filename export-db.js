const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');

async function exportDatabase() {
  const connectionString = 'postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require';
  const pool = new Pool({ connectionString });
  
  try {
    console.log('Connecting to Neon Postgres to fetch tables...');
    
    // Get all public tables
    const { rows: tables } = await pool.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public';
    `);
    
    const dbExport = {};
    
    for (const table of tables) {
      const tableName = table.tablename;
      console.log(`Exporting table: ${tableName}...`);
      const { rows } = await pool.query(`SELECT * FROM "${tableName}"`);
      dbExport[tableName] = rows;
    }
    
    fs.writeFileSync('smartdomdb_export.json', JSON.stringify(dbExport, null, 2));
    console.log('Database successfully exported to smartdomdb_export.json');
  } catch (error) {
    console.error('Error exporting database:', error.message);
  } finally {
    await pool.end();
  }
}

exportDatabase();
