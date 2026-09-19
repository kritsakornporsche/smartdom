const WebSocket = require('ws');
const { Client } = require('ssh2');
console.log('Connecting to Cloudflare Tunnel SSH...');

const ws = new WebSocket('wss://172.67.144.197/', {
  headers: { 'Host': 'ssh.phannext.com' },
  servername: 'ssh.phannext.com',
  rejectUnauthorized: false
});

ws.on('open', () => {
  console.log('WebSocket open, connecting SSH...');
  const duplex = WebSocket.createWebSocketStream(ws);
  const conn = new Client();
  conn.on('ready', () => {
    console.log('SSH ready, executing DB setup...');
    const nodeScript = `
      const mysql = require('mysql2/promise');
      async function main() {
        const db = await mysql.createConnection('mysql://smartdom:smartdom@localhost:3306/smartdomdb');
        
        console.log('1. Creating dormitory_rules table...');
        await db.query(\`
          CREATE TABLE IF NOT EXISTS dormitory_rules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            dorm_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(100) DEFAULT 'ทั่วไป',
            fine_amount DECIMAL(10,2) DEFAULT 0.00,
            is_active TINYINT(1) DEFAULT 1,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_dorm_rules_dorm_id (dorm_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        \`);
        console.log('✅ dormitory_rules table created/verified!');

        console.log('2. Seeding default rules for Dorm 1 & 2 if empty...');
        const [existing] = await db.query('SELECT COUNT(*) as cnt FROM dormitory_rules WHERE dorm_id = 1');
        if (existing[0].cnt === 0) {
          const defaultRules = [
            [1, 'เวลาเปิด-ปิดประตูทางเข้าหลัก', 'ประตูทางเข้าหลักปิดเวลา 23:00 น. หลังจากเวลาดังกล่าวต้องใช้คีย์การ์ดหรือสแกนลายนิ้วมือเท่านั้น', 'การเข้า-ออก', 0, 1],
            [1, 'การนำสัตว์เลี้ยงเข้ามาในหอพัก', 'ห้ามนำสัตว์เลี้ยงทุกชนิดเข้ามาเลี้ยงหรือดูแลภายในห้องพักและพื้นที่ส่วนกลางโดยเด็ดขาด', 'สัตว์เลี้ยง', 1000, 2],
            [1, 'การสูบบุหรี่และสารเสพติด', 'ห้ามสูบบุหรี่ บุหรี่ไฟฟ้า หรือสิ่งเสพติดใดๆ ภายในห้องพักและระเบียง ยกเว้นบริเวณจุดสูบบุหรี่ที่จัดไว้', 'ความปลอดภัย', 2000, 3],
            [1, 'การใช้เสียงและความสงบเรียบร้อย', 'งดใช้เสียงดังรบกวนผู้อื่นหลังเวลา 22:00 น. รวมทั้งการเปิดเพลงหรือเล่นดนตรีเสียงดัง', 'การใช้เสียง', 500, 4],
            [1, 'การรักษาความสะอาดและทิ้งขยะ', 'กรุณาคัดแยกขยะและนำไปทิ้งที่จุดทิ้งขยะรวมของชั้นก่อนเวลา 09:00 น. ห้ามวางขยะหน้าห้องเด็ดขาด', 'ความสะอาด', 300, 5],
            [1, 'ผู้มาติดต่อและผู้พักอาศัยชั่วคราว', 'ผู้มาติดต่อต้องแลกบัตรและออกจากหอพักก่อนเวลา 22:00 น. หากค้างคืนต้องแจ้งผู้ดูแลล่วงหน้า', 'การเข้า-ออก', 500, 6]
          ];
          for (const r of defaultRules) {
            await db.query('INSERT INTO dormitory_rules (dorm_id, title, description, category, fine_amount, sort_order) VALUES (?, ?, ?, ?, ?, ?)', r);
          }
          console.log('✅ Seeded 6 default rules for Dorm 1!');
        }

        // Also ensure owner_id on dorm 1 is synced or owner 5 has user_dorm_roles for dorm 1 & 2
        console.log('3. Ensuring owner 5 (kritsakorn801@gmail.com) has permissions on dorm 1 & 2...');
        await db.query(\`
          INSERT INTO user_dorm_roles (user_id, dorm_id, role, is_active)
          VALUES (5, 1, 'owner', 1), (5, 2, 'owner', 1)
          ON DUPLICATE KEY UPDATE role = 'owner', is_active = 1
        \`);
        await db.query(\`
          UPDATE conversations SET owner_id = 5 WHERE dorm_id IN (1, 2) AND owner_id = 6
        \`);
        console.log('✅ Synced conversations owner_id to user 5 so Pache chat is visible to kritsakorn801@gmail.com!');

        await db.end();
      }
      main().catch(console.error);
    `;

    const b64 = Buffer.from(nodeScript).toString('base64');
    const ps = `
      Set-Location "C:\\kritsakorn\\smartdom"
      [IO.File]::WriteAllText("C:\\kritsakorn\\smartdom\\temp_setup_rules.js", [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("${b64}")))
      node temp_setup_rules.js
      Remove-Item temp_setup_rules.js -Force -ErrorAction SilentlyContinue
    `;
    const psEncoded = Buffer.from(ps, 'utf16le').toString('base64');
    conn.exec(`powershell.exe -NoProfile -EncodedCommand ${psEncoded}`, (err, stream) => {
      if (err) return console.error(err);
      stream.on('data', d => process.stdout.write(d.toString()));
      stream.stderr.on('data', d => process.stderr.write(d.toString()));
      stream.on('close', () => {
        conn.end();
        ws.close();
      });
    });
  }).connect({
    sock: duplex,
    username: 'buain',
    password: 'Zn@27124700',
    readyTimeout: 15000
  });
});
