const WebSocket = require('ws');
const { Client } = require('ssh2');

const ws = new WebSocket('wss://172.67.144.197/', {
  headers: { 'Host': 'ssh.phannext.com' },
  servername: 'ssh.phannext.com',
  rejectUnauthorized: false
});

ws.on('open', () => {
  const duplex = WebSocket.createWebSocketStream(ws);
  const conn = new Client();
  conn.on('ready', () => {
    const nodeCode = `
      const mysql = require('mysql2/promise');
      async function main() {
        const db = await mysql.createConnection('mysql://smartdom:smartdom@localhost:3306/smartdomdb');
        
        console.log('1. Updating dormitory_registry to owner_id = 5, owner_email = kritsakorn801@gmail.com...');
        await db.query("UPDATE dormitory_registry SET owner_id = 5, owner_email = 'kritsakorn801@gmail.com' WHERE id IN (1, 2)");
        await db.query("INSERT INTO user_dorm_roles (user_id, dorm_id, role, is_active) VALUES (5, 1, 'owner', 1) ON DUPLICATE KEY UPDATE role = 'owner', is_active = 1");
        await db.query("INSERT INTO user_dorm_roles (user_id, dorm_id, role, is_active) VALUES (5, 2, 'owner', 1) ON DUPLICATE KEY UPDATE role = 'owner', is_active = 1");

        console.log('2. Creating dormitory_rules table...');
        const createRulesSql = "CREATE TABLE IF NOT EXISTS dormitory_rules (" +
          "id INT AUTO_INCREMENT PRIMARY KEY, " +
          "dorm_id INT NOT NULL, " +
          "category VARCHAR(100) NOT NULL DEFAULT 'general', " +
          "title VARCHAR(255) NOT NULL, " +
          "description TEXT, " +
          "penalty VARCHAR(255), " +
          "severity ENUM('info', 'warning', 'critical') DEFAULT 'warning', " +
          "icon VARCHAR(50) DEFAULT '📌', " +
          "sort_order INT DEFAULT 0, " +
          "is_active TINYINT(1) DEFAULT 1, " +
          "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
          "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
          "INDEX idx_dorm_id (dorm_id)" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        await db.query(createRulesSql);

        const [existingRules] = await db.query("SELECT COUNT(*) as count FROM dormitory_rules WHERE dorm_id = 1");
        if (existingRules[0].count === 0) {
          console.log('3. Seeding default rules...');
          const defaultRules = [
            [1, 'noise', 'งดส่งเสียงดังยามวิกาล', 'ห้ามส่งเสียงดัง ปาร์ตี้ หรือเปิดเพลงเสียงดังรบกวนผู้อื่น หลังเวลา 22:00 น.', 'เตือนครั้งที่ 1 / ปรับ 500 บาท ครั้งถัดไป', 'critical', '🤫', 1],
            [1, 'visitors', 'เวลาเข้า-ออกของผู้มาติดต่อ', 'ผู้มาติดต่อต้องแลกบัตรและออกจากหอพักก่อน 23:00 น. ไม่อนุญาตให้ค้างคืนโดยไม่แจ้งล่วงหน้า', 'ปรับ 500 บาท/คืน', 'warning', '👥', 2],
            [1, 'safety', 'ห้ามสูบบุหรี่และสิ่งเสพติด', 'ห้ามสูบบุหรี่ บุหรี่ไฟฟ้า หรือสิ่งเสพติดทุกชนิดภายในห้องพักและระเบียงทางเดินเด็ดขาด', 'ปรับ 2,000 บาท และเชิญออกทันที', 'critical', '🚭', 3],
            [1, 'pets', 'ไม่อนุญาตให้เลี้ยงสัตว์', 'ห้ามนำสัตว์เลี้ยงทุกชนิดเข้ามาเลี้ยงในบริเวณอาคารและห้องพัก', 'ปรับ 1,000 บาท/วัน', 'critical', '🐾', 4],
            [1, 'cleanliness', 'การทิ้งขยะและความสะอาด', 'กรุณามัดปากถุงขยะให้เรียบร้อยและนำไปทิ้งที่จุดทิ้งขยะรวมชั้น 1 ห้ามวางหน้าห้อง', 'ตักเตือน', 'info', '🗑️', 5],
            [1, 'payment', 'การชำระค่าเช่ารายเดือน', 'กำหนดชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน เกินกำหนดมีค่าปรับวันละ 50 บาท', 'ค่าปรับล่าช้า 50 บ./วัน', 'warning', '💰', 6]
          ];
          for (const r of defaultRules) {
            await db.query("INSERT INTO dormitory_rules (dorm_id, category, title, description, penalty, severity, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", r);
          }
        }

        const [cols] = await db.query("SHOW COLUMNS FROM contracts LIKE 'contract_file_url'");
        if (cols.length === 0) {
          console.log('4. Adding contract_file_url column to contracts...');
          await db.query("ALTER TABLE contracts ADD COLUMN contract_file_url LONGTEXT NULL");
        }

        console.log('5. VERIFY DORM REGISTRY:');
        const [dorms] = await db.query("SELECT id, dorm_name, owner_id, owner_email FROM dormitory_registry WHERE id IN (1, 2)");
        console.log(dorms);

        console.log('6. VERIFY USER DORM ROLES:');
        const [roles] = await db.query("SELECT * FROM user_dorm_roles WHERE user_id = 5");
        console.log(roles);

        console.log('7. VERIFY BILLS:');
        const [bills] = await db.query("SELECT id, dorm_id, room_number, amount, status FROM bills WHERE dorm_id = 1");
        console.log(bills);

        console.log('8. VERIFY TENANTS:');
        const [tenants] = await db.query("SELECT id, name, room_id, dorm_id, status FROM tenants WHERE dorm_id = 1");
        console.log(tenants);

        await db.end();
        console.log('ALL DATABASE UPDATES COMPLETED SUCCESSFULLY!');
      }
      main().catch(console.error);
    `;

    const b64 = Buffer.from(nodeCode, 'utf8').toString('base64');
    const psScript = `
      Set-Location "C:\\kritsakorn\\smartdom"
      [IO.File]::WriteAllBytes("C:\\kritsakorn\\smartdom\\run_db.js", [Convert]::FromBase64String("${b64}"))
      node run_db.js
      Remove-Item "C:\\kritsakorn\\smartdom\\run_db.js" -Force -ErrorAction SilentlyContinue
    `;
    const psEncoded = Buffer.from(psScript, 'utf16le').toString('base64');

    conn.exec(`powershell.exe -NoProfile -EncodedCommand ${psEncoded}`, (err, stream) => {
      if (err) {
        console.error('Remote exec error:', err);
        conn.end();
        ws.close();
        return;
      }
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
    readyTimeout: 20000
  });
});
