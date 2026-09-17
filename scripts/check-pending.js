const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const code = `
    const mysql = require('mysql2/promise');
    (async () => {
      const p = mysql.createPool('mysql://smartdom:smartdom@localhost:3306/smartdomdb');
      await p.query("DELETE FROM booking_progress WHERE room_id IN (SELECT id FROM rooms WHERE dorm_id = 1)");
      
      const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
      const s1 = await (await fetch('http://localhost:3000/api/owner/stats?dormDbName=1')).json();
      console.log('STATS FOR DORM 1 NOW:', s1);

      const [rooms] = await p.query("SELECT status, count(*) as count FROM rooms WHERE dorm_id = 1 GROUP BY status");
      console.log('ROOM STATUS IN DORM 1:', rooms);

      await p.end();
      process.exit(0);

      await p.end();
      process.exit(0);
    })();
  `;
  const b64 = Buffer.from(code).toString('base64');
  conn.exec(`powershell.exe -NoProfile -Command "cd C:\\kritsakorn\\smartdom; node -e \\"eval(Buffer.from('${b64}', 'base64').toString())\\""`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => { conn.end(); process.exit(0); });
  });
}).connect({ host: 'kritsakorn.thddns.net', port: 5995, username: 'buain', password: 'Zn@27124700' });
