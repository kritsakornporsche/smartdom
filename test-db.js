const mysql = require('mysql2/promise'); 
async function run() { 
  try { 
    const c = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdom_platform'); 
    const dbName = 'smartdom_dorm_test'; 
    await c.query('CREATE DATABASE IF NOT EXISTS `smartdom_dorm_test`'); 
    const [tables] = await c.query('SELECT table_name FROM information_schema.tables WHERE table_schema = "smartdom_dorm_1"'); 
    for (const row of tables) { 
      const tableName = row.TABLE_NAME || row.table_name; 
      await c.query(`CREATE TABLE IF NOT EXISTS \`smartdom_dorm_test\`.\`${tableName}\` LIKE \`smartdom_dorm_1\`.\`${tableName}\``); 
    } 
    console.log('Success'); 
    c.end(); 
  } catch(e) { 
    console.error(e); 
  } 
} 
run();
