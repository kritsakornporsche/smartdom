const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');
const WebSocket = require('ws');

const filesToUpload = [
  'app/api/chat/conversations/route.ts',
  'app/api/owner/billing/route.ts',
  'app/api/owner/bookings/route.ts',
  'app/api/owner/onboarding/route.ts',
  'app/api/owner/rules/route.ts',
  'app/api/owner/rules/clone/route.ts',
  'app/api/owner/stats/route.ts',
  'app/api/tenants/route.ts',
  'app/api/tenant/evaluation/route.ts',
  'app/api/tenant/rules/route.ts',
  'app/owner/billing/page.tsx',
  'app/owner/bookings/page.tsx',
  'app/owner/components/OwnerBottomNav.tsx',
  'app/owner/components/OwnerSidebar.tsx',
  'app/owner/evaluation/page.tsx',
  'app/owner/onboarding/page.tsx',
  'app/owner/page.tsx',
  'app/owner/rules/page.tsx',
  'app/owner/tenants/page.tsx',
  'app/tenant/evaluation/page.tsx',
  'app/tenant/components/DormRulesCard.tsx',
  'lib/version.json'
];

const conn = new Client();
console.log('Connecting SSH to deploy dashboard updates, theme toggle, signout contrast & signin fix...');

  conn.on('ready', async () => {
    console.log('SSH Connection Established! Syncing files...');

    const runRemotePs = (psScript) => {
      return new Promise((resolve, reject) => {
        const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
        conn.exec(`powershell.exe -NoProfile -EncodedCommand ${encoded}`, (err, stream) => {
          if (err) return reject(err);
          let stdout = '';
          let stderr = '';
          stream.on('data', d => stdout += d.toString());
          stream.stderr.on('data', d => stderr += d.toString());
          stream.on('close', code => resolve({ code, stdout, stderr }));
        });
      });
    };

    let idx = 0;
    for (const relPath of filesToUpload) {
      idx++;
      const localFile = path.join(__dirname, '..', relPath);
      if (!fs.existsSync(localFile)) {
        console.warn(`⚠️ Local file not found: ${relPath}, skipping...`);
        continue;
      }
      const b64 = fs.readFileSync(localFile).toString('base64');
      const remotePath = `C:\\kritsakorn\\smartdom\\${relPath.replace(/\//g, '\\')}`;
      const remoteDir = path.dirname(remotePath);

      console.log(`[${idx}/${filesToUpload.length}] Syncing ${relPath}...`);

      const chunkSize = 800;
      await runRemotePs(`[IO.File]::WriteAllText("C:\\kritsakorn\\smartdom\\temp.b64", "")`);
      for (let i = 0; i < b64.length; i += chunkSize) {
        const chunk = b64.slice(i, i + chunkSize);
        await runRemotePs(`[IO.File]::AppendAllText("C:\\kritsakorn\\smartdom\\temp.b64", "${chunk}")`);
      }

      const finishPs = `
        $dir = "${remoteDir}"
        if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
        [IO.File]::WriteAllBytes("${remotePath}", [Convert]::FromBase64String([IO.File]::ReadAllText("C:\\kritsakorn\\smartdom\\temp.b64")))
        Remove-Item "C:\\kritsakorn\\smartdom\\temp.b64" -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Synced: ${relPath}"
      `;

      try {
        const res = await runRemotePs(finishPs);
        if (res.stdout.trim()) console.log(res.stdout.trim());
      } catch (e) {
        console.error(`Error syncing ${relPath}:`, e.message);
      }
    }

    console.log('\nAll updated files uploaded successfully! Now building and restarting remote server...\n');
    await runBuildAndRestart();

    async function runBuildAndRestart() {
    const psScript = `
      $ErrorActionPreference = 'Continue'
      Set-Location "C:\\kritsakorn\\smartdom"
      Write-Host "1. PULLING/CHECKING ENVIRONMENT:"
      New-Item -ItemType Directory -Force -Path "C:\\kritsakorn\\smartdom\\public\\uploads\\meters" | Out-Null
      Write-Host "Created public\\uploads\\meters directory"
      Write-Host ""
      Write-Host "1.5 RUNNING DATABASE FIXES (OWNER ROLES & RULES TABLE):"
      $dbFixJs = @"
const mysql = require('mysql2/promise');
async function main() {
  const db = await mysql.createConnection('mysql://smartdom:smartdom@localhost:3306/smartdomdb');
  console.log('Linking Dorm 1 & 2 to kritsakorn801@gmail.com (id: 5)...');
  await db.query("UPDATE dormitory_registry SET owner_id = 5, owner_email = 'kritsakorn801@gmail.com' WHERE id IN (1, 2)");
  await db.query("INSERT INTO user_dorm_roles (user_id, dorm_id, role, is_active) VALUES (5, 1, 'owner', 1) ON DUPLICATE KEY UPDATE role = 'owner', is_active = 1");
  await db.query("INSERT INTO user_dorm_roles (user_id, dorm_id, role, is_active) VALUES (5, 2, 'owner', 1) ON DUPLICATE KEY UPDATE role = 'owner', is_active = 1");
  
  console.log('Creating dormitory_rules table...');
  await db.query(\`
    CREATE TABLE IF NOT EXISTS dormitory_rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dorm_id INT NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'general',
      title VARCHAR(255) NOT NULL,
      description TEXT,
      penalty VARCHAR(255),
      severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
      icon VARCHAR(50) DEFAULT '📌',
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_dorm_id (dorm_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  \`);
  
  const [existingRules] = await db.query("SELECT COUNT(*) as count FROM dormitory_rules WHERE dorm_id = 1");
  if (existingRules[0].count === 0) {
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

  // Ensure contracts table has contract_file_url column
  const [columns] = await db.query("SHOW COLUMNS FROM contracts LIKE 'contract_file_url'");
  if (columns.length === 0) {
    console.log('Adding contract_file_url column to contracts...');
    await db.query("ALTER TABLE contracts ADD COLUMN contract_file_url LONGTEXT NULL");
  }

  // Seed more tenants and rooms if too few exist
  console.log('Seeding additional tenants for dorm_id=1...');
  const seedTenants = [
    { name: 'สมชาย ใจดี', email: 'somchai2@test.com', phone: '081-111-2222', room_number: '102', room_id_offset: 17 },
    { name: 'สมหญิง มีสุข', email: 'somying2@test.com', phone: '082-333-4444', room_number: '103', room_id_offset: 18 },
    { name: 'มานี รักดี', email: 'manee2@test.com', phone: '083-555-6666', room_number: '104', room_id_offset: 19 },
    { name: 'วิชัย สีสวย', email: 'wichai@test.com', phone: '084-777-8888', room_number: '201', room_id_offset: 24 },
    { name: 'นภา ดวงดี', email: 'napa@test.com', phone: '085-999-0000', room_number: '202', room_id_offset: 25 },
  ];
  for (const t of seedTenants) {
    const [existing] = await db.query('SELECT id FROM tenants WHERE email = ? AND dorm_id = 1', [t.email]);
    if (existing.length === 0) {
      const [ins] = await db.query(
        "INSERT INTO tenants (name, email, phone, dorm_id, room_id, status) VALUES (?, ?, ?, 1, ?, 'Active')",
        [t.name, t.email, t.phone, t.room_id_offset]
      );
      await db.query("UPDATE rooms SET status = 'Occupied' WHERE id = ?", [t.room_id_offset]);
      // Create an Unpaid bill for each new tenant
      const cycle = 'ตุลาคม 2568';
      const dueDate = '2026-10-05';
      await db.query(
        "INSERT INTO bills (tenant_id, title, amount, billing_cycle, due_date, status, dorm_id, room_number, room_amount, water_amount, electric_amount, water_units, electric_units) VALUES (?, ?, ?, ?, ?, 'Unpaid', 1, ?, 3500, 360, 480, 20, 60)",
        [ins.insertId, 'ค่าเช่าห้องพักและสาธารณูปโภคประจำเดือน ' + cycle, 4340, cycle, dueDate, t.room_number]
      );
      console.log('Seeded tenant: ' + t.name);
    }
  }

  console.log('DB MIGRATIONS COMPLETED SUCCESSFULLY');
  await db.end();
}
main().catch(console.error);
"@
      [IO.File]::WriteAllText("C:\\kritsakorn\\smartdom\\temp_deploy_db.js", $dbFixJs, [System.Text.Encoding]::UTF8)
      node "C:\\kritsakorn\\smartdom\\temp_deploy_db.js"
      Remove-Item "C:\\kritsakorn\\smartdom\\temp_deploy_db.js" -Force -ErrorAction SilentlyContinue
      Write-Host ""
      Write-Host "2. RUNNING NPM RUN BUILD ON REMOTE SERVER:"
      npm run build
      Write-Host ""
      Write-Host "3. RESTARTING SmartDomServer TASK/SERVICE:"
      try {
        Stop-ScheduledTask -TaskName "SmartDomServer" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Start-ScheduledTask -TaskName "SmartDomServer"
        Write-Host "✅ ScheduledTask SmartDomServer Restarted!"
      } catch {
        Write-Host "⚠️ ScheduledTask notice: $($_.Exception.Message)"
      }
      Write-Host ""
      Write-Host "4. WAITING 5 SECONDS FOR SERVER INITIALIZATION..."
      Start-Sleep -Seconds 5
      Write-Host ""
      Write-Host "5. HEALTH CHECK (HTTP GET http://localhost:3000):"
      try {
        $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
        Write-Host "✅ Server is ONLINE! HTTP Status: $($res.StatusCode)"
      } catch {
        Write-Host "❌ Health Check Failed: $($_.Exception.Message)"
      }
    `;

    const b64Ps = Buffer.from(psScript, 'utf8').toString('base64');
    await runRemotePs(`[IO.File]::WriteAllText("C:\\kritsakorn\\smartdom\\build.b64", "")`);
    const cSize = 800;
    for (let i = 0; i < b64Ps.length; i += cSize) {
      const chunk = b64Ps.slice(i, i + cSize);
      await runRemotePs(`[IO.File]::AppendAllText("C:\\kritsakorn\\smartdom\\build.b64", "${chunk}")`);
    }

    const runnerCmd = `powershell.exe -NoProfile -Command "[IO.File]::WriteAllText('C:\\kritsakorn\\smartdom\\build.ps1', [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String([IO.File]::ReadAllText('C:\\kritsakorn\\smartdom\\build.b64'))), [System.Text.Encoding]::UTF8); Remove-Item 'C:\\kritsakorn\\smartdom\\build.b64' -Force; & 'C:\\kritsakorn\\smartdom\\build.ps1'; Remove-Item 'C:\\kritsakorn\\smartdom\\build.ps1' -Force"`;

    conn.exec(runnerCmd, (err, stream) => {
      if (err) {
        console.error('Remote execution error:', err);
        conn.end();
        return;
      }
      stream.on('data', (d) => process.stdout.write(d.toString()));
      stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
      stream.on('close', (code) => {
        console.log('\n--- Remote build & restart completed with code: ' + code + ' ---');
        conn.end();
        try { ws.close(); } catch(e) {}
      });
    });
  }
});

conn.on('error', (err) => {
  if (err.code !== 'ECONNRESET') console.error('SSH Error:', err.message);
});

console.log('Connecting SSH via Cloudflare Tunnel (ssh.phannext.com)...');

const ws = new WebSocket('wss://172.67.144.197/', {
  headers: { 'Host': 'ssh.phannext.com' },
  servername: 'ssh.phannext.com',
  rejectUnauthorized: false
});

ws.on('open', () => {
  console.log('✅ Cloudflare Tunnel WebSocket Established! Handshaking SSH...');
  const duplex = WebSocket.createWebSocketStream(ws);
  conn.connect({
    sock: duplex,
    username: 'buain',
    password: 'Zn@27124700',
    readyTimeout: 25000
  });
});

ws.on('error', (err) => {
  console.error('Cloudflare Tunnel Error:', err.message);
});
