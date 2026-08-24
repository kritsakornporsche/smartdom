const { neon } = require('../lib/mysql-adapter');
require('dotenv').config({ path: '.env.local' });

(async () => {
  console.log('🚀 Seeding Additional Simulation Data (Accounting, Announcements, Maintenance, Keepers)...');
  const sql = neon(process.env.DATABASE_URL);

  // 1. Create accounting_transactions table
  await sql`
    CREATE TABLE IF NOT EXISTS accounting_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dorm_id INT NOT NULL DEFAULT 1,
      db_name VARCHAR(100) NULL,
      type ENUM('Income', 'Expense') NOT NULL,
      category VARCHAR(100) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      description TEXT NULL,
      transaction_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`DELETE FROM accounting_transactions WHERE id > 0`;

  // Seed 6 Months of Accounting Transactions for Dorm 1-4
  const dorms = [1, 2, 3, 4];
  const months = [
    { year: 2026, month: 3, rentIncome: 105000, utilIncome: 14200, expElec: 8200, expWater: 1800, expMaint: 3500, expSalary: 28000 },
    { year: 2026, month: 4, rentIncome: 105000, utilIncome: 16800, expElec: 9800, expWater: 2100, expMaint: 4200, expSalary: 28000 },
    { year: 2026, month: 5, rentIncome: 105000, utilIncome: 15400, expElec: 8900, expWater: 1900, expMaint: 2800, expSalary: 28000 },
    { year: 2026, month: 6, rentIncome: 105000, utilIncome: 16100, expElec: 9200, expWater: 2000, expMaint: 3100, expSalary: 28000 },
    { year: 2026, month: 7, rentIncome: 105000, utilIncome: 17200, expElec: 9600, expWater: 2200, expMaint: 5400, expSalary: 28000 },
    { year: 2026, month: 8, rentIncome: 105000, utilIncome: 18500, expElec: 10100, expWater: 2400, expMaint: 3800, expSalary: 28000 },
  ];

  for (const d of dorms) {
    const multiplier = d === 3 ? 1.6 : (d === 4 ? 1.3 : (d === 2 ? 0.8 : 1.0));
    for (const m of months) {
      const dateStr = `${m.year}-0${m.month}-28`;
      
      // Income: Rent
      await sql`
        INSERT INTO accounting_transactions (dorm_id, type, category, amount, description, transaction_date)
        VALUES (${d}, 'Income', 'Rent', ${m.rentIncome * multiplier}, ${'รายรับค่าเช่าห้องพักประจำเดือน ' + m.month + '/' + m.year}, ${dateStr})
      `;

      // Income: Utility
      await sql`
        INSERT INTO accounting_transactions (dorm_id, type, category, amount, description, transaction_date)
        VALUES (${d}, 'Income', 'Utility', ${m.utilIncome * multiplier}, ${'รายรับค่าน้ำ-ค่าไฟประจำเดือน ' + m.month + '/' + m.year}, ${dateStr})
      `;

      // Expense: Electricity MEA/PEA
      await sql`
        INSERT INTO accounting_transactions (dorm_id, type, category, amount, description, transaction_date)
        VALUES (${d}, 'Expense', 'Electricity', ${m.expElec * multiplier}, ${'ชำระค่าไฟฟ้าหลวง การไฟฟ้าส่วนภูมิภาค ' + m.month + '/' + m.year}, ${dateStr})
      `;

      // Expense: Water MWA/PWA
      await sql`
        INSERT INTO accounting_transactions (dorm_id, type, category, amount, description, transaction_date)
        VALUES (${d}, 'Expense', 'Water', ${m.expWater * multiplier}, ${'ชำระค่าน้ำประปาส่วนภูมิภาค ' + m.month + '/' + m.year}, ${dateStr})
      `;

      // Expense: Maintenance
      await sql`
        INSERT INTO accounting_transactions (dorm_id, type, category, amount, description, transaction_date)
        VALUES (${d}, 'Expense', 'Maintenance', ${m.expMaint * multiplier}, ${'ค่าอะไหล่และอุปกรณ์ซ่อมบำรุงอาคาร ' + m.month + '/' + m.year}, ${dateStr})
      `;

      // Expense: Staff Salary
      await sql`
        INSERT INTO accounting_transactions (dorm_id, type, category, amount, description, transaction_date)
        VALUES (${d}, 'Expense', 'Salary', ${m.expSalary * multiplier}, ${'เงินเดือนพนักงาน แม่บ้าน และช่างอาคาร ' + m.month + '/' + m.year}, ${dateStr})
      `;
    }
  }
  console.log('✅ Accounting transactions seeded successfully.');

  // 2. Seed Announcements
  await sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general'`;
  await sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1`;
  await sql`DELETE FROM announcements WHERE id > 0`;
  const announcements = [
    {
      dorm_id: 1,
      title: '📢 แจ้งกำหนดการล้างถังพักน้ำและตรวจสอบระบบประปาหอพัก',
      content: 'ทางหอพักเกษตร 2 จะดำเนินการล้างถังพักน้ำประจำปี ในวันเสาร์ที่ 29 สิงหาคม 2569 เวลา 09:00 - 14:00 น. ขอให้ลูกหอทุกท่านสำรองน้ำใช้ล่วงหน้า ขออภัยในความไม่สะดวกครับ',
      category: 'announcement',
      is_important: 1,
      is_active: 1
    },
    {
      dorm_id: 1,
      title: '⚡ แจ้งชำระค่าเช่าและค่าน้ำ-ไฟ ประจำรอบเดือนสิงหาคม 2569',
      content: 'บิลค่าเช่าประจำเดือนสิงหาคม 2569 ได้ออกเรียบร้อยแล้ว ลูกหอสามารถเข้าดูยอดและสแกน QR Code พร้อมเพย์ตามยอดบิลจริงผ่านระบบ SmartDom ได้ตั้งแต่วันนี้จนถึงสิ้นเดือนครับ',
      category: 'billing',
      is_important: 1,
      is_active: 1
    },
    {
      dorm_id: 1,
      title: '📶 อัปเกรดระบบอินเทอร์เน็ต Wi-Fi 6 ความเร็วสูงทุกชั้น',
      content: 'หอพักได้ติดตั้งจุดกระจายสัญญาณ Wi-Fi 6 เพิ่มเติมบริเวณโถงทางเดินชั้น 1-4 เรียบร้อยแล้ว เพื่อรองรับการเรียนออนไลน์และทำงานได้อย่างเสถียรยิ่งขึ้น',
      category: 'facility',
      is_important: 0,
      is_active: 1
    },
    {
      dorm_id: 1,
      title: '🧹 กำหนดการฉีดพ่นยากันยุงและแมลงบริเวณรอบอาคาร',
      content: 'วันอาทิตย์นี้เวลา 16:00 น. จะมีการฉีดพ่นละอองฝอยกำจัดยุงลายรอบบริเวณหอพักและที่จอดรถ กรุณาปิดหน้าต่างห้องพักของท่าน',
      category: 'announcement',
      is_important: 0,
      is_active: 1
    }
  ];

  for (const a of announcements) {
    await sql`
      INSERT INTO announcements (dorm_id, title, content, category, is_important, is_active)
      VALUES (${a.dorm_id}, ${a.title}, ${a.content}, ${a.category}, ${a.is_important}, ${a.is_active})
    `;
  }
  console.log('✅ Announcements seeded successfully.');

  // 3. Update maintenance_requests with dorm_id & tenant links
  await sql`
    ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS dorm_id INT DEFAULT 1;
  `;
  await sql`
    UPDATE maintenance_requests m
    JOIN tenants t ON m.tenant_id = t.id
    SET m.dorm_id = t.dorm_id
  `;

  console.log('🎉 All simulation tables updated and ready!');
})();
