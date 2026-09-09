const path = require('path');
const { Pool } = require(path.join(__dirname, '../lib/mysql-adapter'));

const MYSQL_BASE = 'mysql://smartdom:smartdom@kritsakorn.thddns.net:5994';
const pool = new Pool({ connectionString: `${MYSQL_BASE}/smartdomdb` });

const getDb = () => {
  return async function(strings, ...values) {
    if (Array.isArray(strings) && strings.raw) {
      let queryText = '';
      const params = [];
      for (let i = 0; i < strings.length; i++) {
        queryText += strings[i];
        if (i < values.length) {
          queryText += '?';
          params.push(values[i]);
        }
      }
      const res = await pool.query(queryText, params);
      return res.rows;
    } else {
      const res = await pool.query(strings, values[0] || []);
      return res.rows;
    }
  };
};

async function main() {
  const sql = getDb();
  console.log('Testing sql query...');
  const r = await sql`SELECT 1 as val`;
  console.log('Result:', r);
}

main().catch(console.error);
