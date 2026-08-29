const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const nodeScript = `
    const { getDb } = require('./lib/db');
    (async () => {
      try {
        const sql = getDb();
        const res = await sql\`
          UPDATE bills 
          SET status = 'Pending', slip_url = 'test_slip_data' 
          WHERE id = 784
        \`;
        console.log('Update result:', res);
        
        const check = await sql\`SELECT id, status, slip_url FROM bills WHERE id = 784\`;
        console.log('Check result:', check);
      } catch (err) {
        console.error('SQL Error:', err);
      }
      process.exit(0);
    })();
  `;
  const encoded = Buffer.from(nodeScript).toString('base64');
  conn.exec(`cmd /c "cd /d C:\\kritsakorn\\smartdom && node -e \\"eval(Buffer.from('${encoded}', 'base64').toString('utf8'))\\""`, (err, stream) => {
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
}).on('error', e => {}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
