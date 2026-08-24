const { Client } = require('ssh2');

const conn = new Client();

console.log('Connecting to SSH buain@kritsakorn.thddns.net:5995...');

conn.on('ready', () => {
  console.log('✅ SSH Connected!');
  
  // Check netstat for MySQL ports and list databases
  const cmd = `cmd /c "netstat -ano | findstr 3306 & netstat -ano | findstr 5994 & dir C:\\kritsakorn\\smartdom & C:\\xampp\\mysql\\bin\\mysql.exe -u root -e \\"SHOW DATABASES;\\""`;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }
    stream.on('close', (code) => {
      console.log(`Command closed with code ${code}`);
      conn.end();
    }).on('data', (data) => {
      console.log('' + data);
    }).stderr.on('data', (data) => {
      console.error('' + data);
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 30000,
});
