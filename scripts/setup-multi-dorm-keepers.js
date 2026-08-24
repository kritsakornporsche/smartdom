const { neon } = require('../lib/mysql-adapter');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const sql = neon(process.env.DATABASE_URL);
  console.log('🚀 Setting up Multi-Dormitory Keepers & Technicians schema and data...');

  // 1. Create keeper_dormitories table
  await sql`
    CREATE TABLE IF NOT EXISTS keeper_dormitories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      keeper_id INT NULL,
      dorm_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_dorm (user_id, dorm_id)
    )
  `;
  console.log('✅ Table keeper_dormitories created/ready.');

  // Clear existing mappings
  await sql`DELETE FROM keeper_dormitories WHERE id > 0`;

  // Get all users and keepers
  const users = await sql`SELECT id, email, name, role FROM users WHERE role = 'keeper' OR email LIKE '%keeper%' OR email LIKE '%tech%' OR email LIKE '%somjai%'`;
  const keepers = await sql`SELECT id, email, user_id, dorm_id, position FROM keepers`;

  // Map user emails to user_id and keeper_id
  const userMap = {};
  users.forEach(u => { userMap[u.email] = u; });

  const keeperMap = {};
  keepers.forEach(k => { keeperMap[k.email] = k; });

  // Assignments:
  // 1) ป้าประนอม (keeper@kaset2.com) -> Dorm 1 (เกษตร 2) & Dorm 2 (เกษตรพรีเมียร์)
  // 2) ช่างสมศักดิ์ (tech@kaset2.com) -> Dorm 1 (เกษตร 2) & Dorm 2 (เกษตรพรีเมียร์)
  // 3) พี่สมใจ (somjai@kaset2.com) -> Dorm 1
  // 4) ป้ามาลี (malee@premier.com) -> Dorm 2
  // 5) ช่างวิรัช (wirat@premier.com) -> Dorm 2
  // 6) ป้าบัวคำ (buakham@phukham.com) -> Dorm 3
  // 7) ป้าจันทร์ (jan@phukham.com) -> Dorm 3
  // 8) ช่างประสิทธิ์ (prasit@phukham.com) -> Dorm 3 (ภูคำวิลล่า) & Dorm 4 (เวียงพะเยาเพลส)
  // 9) ช่างมนัส (manat@phukham.com) -> Dorm 3 (ภูคำวิลล่า) & Dorm 4 (เวียงพะเยาเพลส)
  // 10) ป้าสายหยุด (saiyud@wiangplace.com) -> Dorm 4
  // 11) ช่างเอก (ake@wiangplace.com) -> Dorm 4
  // 12) ป้าจำรัส (jumras@wiangplace.com) -> Dorm 4

  const assignments = [
    { email: 'keeper@kaset2.com', dormIds: [1, 2] },
    { email: 'tech@kaset2.com', dormIds: [1, 2] },
    { email: 'somjai@kaset2.com', dormIds: [1] },
    { email: 'malee@premier.com', dormIds: [2] },
    { email: 'wirat@premier.com', dormIds: [2] },
    { email: 'buakham@phukham.com', dormIds: [3] },
    { email: 'jan@phukham.com', dormIds: [3] },
    { email: 'prasit@phukham.com', dormIds: [3, 4] },
    { email: 'manat@phukham.com', dormIds: [3, 4] },
    { email: 'saiyud@wiangplace.com', dormIds: [4] },
    { email: 'ake@wiangplace.com', dormIds: [4] },
    { email: 'jumras@wiangplace.com', dormIds: [4] },
  ];

  for (const item of assignments) {
    const user = userMap[item.email];
    const keeper = keeperMap[item.email];
    if (user) {
      for (const dormId of item.dormIds) {
        await sql`
          INSERT INTO keeper_dormitories (user_id, keeper_id, dorm_id)
          VALUES (${user.id}, ${keeper?.id || null}, ${dormId})
          ON DUPLICATE KEY UPDATE dorm_id = ${dormId}
        `;
      }
    }
  }

  // Also verify cleaning_jobs has all required columns
  await sql`ALTER TABLE cleaning_jobs ADD COLUMN IF NOT EXISTS dorm_id INT DEFAULT 1`;
  await sql`ALTER TABLE cleaning_jobs ADD COLUMN IF NOT EXISTS job_type VARCHAR(100) DEFAULT 'ทำความสะอาดทั่วไป'`;
  await sql`ALTER TABLE cleaning_jobs ADD COLUMN IF NOT EXISTS notes TEXT`;
  await sql`ALTER TABLE cleaning_jobs ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255)`;

  // Seed sample cleaning jobs for Dorm 1 and Dorm 2
  await sql`DELETE FROM cleaning_jobs WHERE id > 0`;
  const dorm1Rooms = await sql`SELECT id, room_number FROM rooms WHERE dorm_id = 1 LIMIT 5`;
  const dorm2Rooms = await sql`SELECT id, room_number FROM rooms WHERE dorm_id = 2 LIMIT 5`;

  for (const r of dorm1Rooms) {
    await sql`
      INSERT INTO cleaning_jobs (room_id, dorm_id, task, status, job_type, notes, created_at)
      VALUES (${r.id}, 1, 'ทำความสะอาดห้องพัก', 'in_progress', 'ทำความสะอาดประจำรอบ (หอเกษตร 2)', 'เช็ดถูพื้น ล้างห้องน้ำ และเปลี่ยนผ้าปู', NOW())
    `;
  }
  for (const r of dorm2Rooms) {
    await sql`
      INSERT INTO cleaning_jobs (room_id, dorm_id, task, status, job_type, notes, created_at)
      VALUES (${r.id}, 2, 'เตรียมห้องพักว่าง', 'pending', 'ทำความสะอาดห้องว่างรอส่งมอบ (หอเกษตรพรีเมียร์)', 'ตรวจเช็คความเรียบร้อยและฉีดพ่นฆ่าเชื้อ', NOW())
    `;
  }

  console.log('🎉 Multi-Dormitory Keeper setup finished successfully!');
})();
