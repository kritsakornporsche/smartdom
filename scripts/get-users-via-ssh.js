const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const queryCmd = `node -e "const mysql = require('mysql2/promise'); (async() => { const c = await mysql.createConnection('mysql://smartdom:smartdom@127.0.0.1:3306/smartdomdb'); const [u] = await c.query('SELECT id, email, role, status FROM users ORDER BY id DESC LIMIT 15'); console.log(JSON.stringify(u, null, 2)); await c.end(); })().catch(console.error);"`;
  conn.exec(`cd /d C:\\kritsakorn\\smartdom && ${queryCmd}`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => {
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
