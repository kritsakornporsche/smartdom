const bcrypt = require('bcryptjs');
const { neon } = require('../lib/mysql-adapter');
require('dotenv').config({ path: '.env.local' });

(async () => {
  console.log('🌱 Seeding complete data across all dimensions for SmartDom...');
  const sql = neon(process.env.DATABASE_URL);

  // 1. Announcements
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS smartdomdb.announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dorm_id INT NOT NULL DEFAULT 1,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'General',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`DELETE FROM announcements WHERE dorm_id = 1`;
    await sql`
      INSERT INTO announcements (dorm_id, title, content, category)
      VALUES 
      (1, 'แจ้งกำหนดการล้างถังพักน้ำประจำปี 2569', 'ทางหอพักเกษตร 2 จะดำเนินการล้างถังพักน้ำในวันที่ 28 สิงหาคม 2569 เวลา 09.00 - 12.00 น. ขออภัยในความไม่สะดวก', 'Maintenance'),
      (1, 'มาตรการประหยัดพลังงานและการแยกขยะ', 'ขอความร่วมมือผู้เช่าทุกห้องช่วยกันคัดแยกขยะก่อนทิ้ง และปิดเครื่องใช้ไฟฟ้าเมื่อไม่อยู่ในห้องพัก', 'General')
    `;
  } catch (e) { console.log('Announcements seed:', e.message); }

  // 2. Packages & Subscriptions for Platform
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS smartdomdb.dormitory_packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        billing_cycle VARCHAR(50) DEFAULT 'Monthly',
        max_rooms INT DEFAULT 50,
        max_dorms INT DEFAULT 1,
        features TEXT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const pkgs = await sql`SELECT id FROM dormitory_packages LIMIT 1`;
    if (pkgs.length === 0) {
      await sql`
        INSERT INTO dormitory_packages (name, price, billing_cycle, max_rooms, max_dorms, features)
        VALUES 
        ('Standard Dorm', 499.00, 'Monthly', 30, 1, 'ระบบจัดการห้องพัก, ออกบิลค่าน้ำไฟ, QR พร้อมเพย์'),
        ('Pro Dormitory', 999.00, 'Monthly', 100, 3, 'ระบบสัญญาดิจิทัล, บัญชีรายรับรายจ่าย, แจ้งซ่อมบำรุง'),
        ('Enterprise Multi-Branch', 1999.00, 'Monthly', 500, 10, 'ไม่จำกัดสาขา, ระบบพนักงานและแม่บ้าน, API บัญชี')
      `;
    }
  } catch (e) { console.log('Packages seed:', e.message); }

  // 3. Platform Admin User
  try {
    const adminHash = await bcrypt.hash('Password123!', 10);
    await sql`
      CREATE TABLE IF NOT EXISTS smartdomdb.platform_admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'platform_admin',
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const adm = await sql`SELECT id FROM platform_admins WHERE email = 'admin@kaset2.com'`;
    if (adm.length === 0) {
      await sql`
        INSERT INTO platform_admins (name, email, password, role)
        VALUES ('นายอนันต์ ผู้ดูแลระบบ', 'admin@kaset2.com', ${adminHash}, 'platform_admin')
      `;
    }
  } catch (e) { console.log('Platform admin seed:', e.message); }

  console.log('🎉 Seed dimensions ready!');
})();
