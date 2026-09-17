const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to remote server kritsakorn.thddns.net:5995...');

conn.on('ready', () => {
  console.log('SSH Connection Established!');

  const sqlMigration = `
    const mysql = require('mysql2/promise');
    (async () => {
      try {
        const pool = mysql.createPool('mysql://smartdom:smartdom@localhost:3306/smartdomdb');
        
        console.log('Creating conversations table...');
        await pool.query(\`
          CREATE TABLE IF NOT EXISTS conversations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            guest_id INT NOT NULL,
            owner_id INT NOT NULL,
            dorm_id INT NOT NULL,
            last_message TEXT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_guest (guest_id),
            INDEX idx_owner (owner_id),
            INDEX idx_dorm (dorm_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        \`);
        console.log('conversations table ready.');

        console.log('Creating chat_messages table...');
        await pool.query(\`
          CREATE TABLE IF NOT EXISTS chat_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            conversation_id INT NOT NULL,
            sender_id INT NOT NULL,
            message TEXT NOT NULL,
            is_read TINYINT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_conv (conversation_id),
            INDEX idx_sender (sender_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        \`);
        console.log('chat_messages table ready.');

        const [tables] = await pool.query("SHOW TABLES LIKE '%chat%'");
        console.log('Chat tables:', tables);
        const [tables2] = await pool.query("SHOW TABLES LIKE '%conv%'");
        console.log('Conv tables:', tables2);

        await pool.end();
      } catch (err) {
        console.error('Migration error:', err);
      }
      process.exit(0);
    })();
  `;

  const b64 = Buffer.from(sqlMigration).toString('base64');
  conn.exec(`powershell.exe -NoProfile -Command "cd C:\\kritsakorn\\smartdom; node -e \\"eval(Buffer.from('${b64}', 'base64').toString())\\""`, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', code => {
      console.log('\n--- Migration finished with code: ' + code + ' ---');
      conn.end();
    });
  });
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700'
});
