const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
console.log('Connecting to remote server kritsakorn.thddns.net:5995...');

conn.on('ready', () => {
  console.log('SSH Connection Established!');

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    const scriptContent = `
      const mysql = require('mysql2/promise');
      (async () => {
        try {
          const pool = mysql.createPool('mysql://smartdom:smartdom@localhost:3306/smartdomdb');
          
          const [pendingBills] = await pool.query('SELECT id, dorm_id, room_number, status, slip_url, amount FROM bills WHERE status = "Pending"');
          console.log('>>> PENDING_BILLS_COUNT:', pendingBills.length);
          for (const pb of pendingBills) {
            console.log('>>> PENDING_BILL:', pb.id, 'DORM:', pb.dorm_id, 'ROOM:', pb.room_number, 'STATUS:', pb.status, 'SLIP:', pb.slip_url);
          }

          await pool.end();
        } catch (e) {
          console.error(e);
        }
        process.exit(0);
      })();
    `;

    const writeStream = sftp.createWriteStream('C:/kritsakorn/smartdom/scratch-check.js');
    writeStream.write(scriptContent);
    writeStream.end(() => {
      console.log('Script uploaded to remote server.');

      conn.exec('powershell.exe -NoProfile -Command "cd C:\\kritsakorn\\smartdom; node scratch-check.js > diag.log"', (err, stream) => {
        stream.on('close', () => {
          sftp.readFile('C:/kritsakorn/smartdom/diag.log', 'utf8', (err, data) => {
            console.log('=== DIAG LOG CONTENT ===\n' + data);
            conn.end();
          });
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 10000
});
