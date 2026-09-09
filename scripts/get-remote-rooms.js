const { Client } = require('ssh2');

const conn = new Client();
conn.on('error', () => {});
conn.on('ready', () => {
  const psCmd = `powershell.exe -NoProfile -Command "Set-Location 'C:\\kritsakorn\\smartdom'; node -e \\"const mysql = require('mysql2/promise'); (async() => { const c = await mysql.createConnection('mysql://smartdom:smartdom@localhost:3306/smartdomdb'); const [r] = await c.query('SELECT r.id, r.room_number, r.status, r.price, dr.dorm_name FROM rooms r JOIN dormitory_registry dr ON r.dorm_id = dr.id LIMIT 10'); console.table(r); await c.end(); })().catch(console.error);\\""`;
  conn.exec(psCmd, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
