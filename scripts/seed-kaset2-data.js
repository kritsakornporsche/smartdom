const bcrypt = require('bcryptjs');
const { neon } = require('../lib/mysql-adapter');
require('dotenv').config({ path: '.env.local' });

(async () => {
  console.log('🌱 SEEDING COMPREHENSIVE TEST DATA FOR หอพักเกษตร 2...');
  const sql = neon(process.env.DATABASE_URL);

  // 1. Ensure Columns
  try {
    await sql`ALTER TABLE smartdomdb.tenants ADD COLUMN IF NOT EXISTS dorm_id INT DEFAULT 1;`;
    await sql`ALTER TABLE smartdomdb.rooms ADD COLUMN IF NOT EXISTS dorm_id INT DEFAULT 1;`;
    await sql`ALTER TABLE smartdomdb.bills ADD COLUMN IF NOT EXISTS dorm_id INT DEFAULT 1;`;
    await sql`ALTER TABLE smartdomdb.bills ADD COLUMN IF NOT EXISTS room_number VARCHAR(50) NULL;`;
    await sql`ALTER TABLE smartdomdb.bills ADD COLUMN IF NOT EXISTS water_units DECIMAL(10,2) DEFAULT 0;`;
    await sql`ALTER TABLE smartdomdb.bills ADD COLUMN IF NOT EXISTS electric_units DECIMAL(10,2) DEFAULT 0;`;
    await sql`ALTER TABLE smartdomdb.bills ADD COLUMN IF NOT EXISTS water_amount DECIMAL(10,2) DEFAULT 0;`;
    await sql`ALTER TABLE smartdomdb.bills ADD COLUMN IF NOT EXISTS electric_amount DECIMAL(10,2) DEFAULT 0;`;
    await sql`ALTER TABLE smartdomdb.bills ADD COLUMN IF NOT EXISTS room_amount DECIMAL(10,2) DEFAULT 0;`;
  } catch (e) {
    console.log('Column check notice:', e.message);
  }

  // 2. Dormitory Profile & Registry
  console.log('Updating Dormitory Registry & Profile...');
  const existingReg = await sql`SELECT id FROM dormitory_registry WHERE id = 1`;
  if (existingReg.length > 0) {
    await sql`
      UPDATE dormitory_registry 
      SET 
        dorm_name = 'หอพักเกษตร 2 (ม.พะเยา)',
        owner_name = 'เจ้าของหอพักเกษตร 2',
        owner_email = 'owner@kaset2.com',
        phone = '081-234-5678',
        address = '123 หมู่ 6 ต.แม่กา อ.เมือง จ.พะเยา 56000 (หน้า ม.พะเยา)',
        status = 'Active'
      WHERE id = 1
    `;
  } else {
    await sql`
      INSERT INTO dormitory_registry (id, owner_email, owner_name, dorm_name, db_name, phone, address, status, owner_id)
      VALUES (1, 'owner@kaset2.com', 'เจ้าของหอพักเกษตร 2', 'หอพักเกษตร 2 (ม.พะเยา)', 'smartdom_dorm_1', '081-234-5678', '123 หมู่ 6 ต.แม่กา อ.เมือง จ.พะเยา 56000 (หน้า ม.พะเยา)', 'Active', 1)
    `;
  }

  const existingProfile = await sql`SELECT id FROM dormitory_profile WHERE dorm_id = 1 OR id = 1`;
  if (existingProfile.length > 0) {
    await sql`
      UPDATE dormitory_profile 
      SET 
        name = 'หอพักเกษตร 2 (ม.พะเยา)',
        address = '123 หมู่ 6 ต.แม่กา อ.เมือง จ.พะเยา 56000 (หน้า ม.พะเยา)',
        phone = '081-234-5678',
        dorm_id = 1,
        cover_image = '/up-logo.png',
        description = 'หอพักเกษตร 2 หอพักคุณภาพใกล้มหาวิทยาลัยพะเยา ห้องกว้าง เฟอร์นิเจอร์ครบ แอร์ เครื่องทำน้ำอุ่น ฟรี Wi-Fi ที่จอดรถสะดวก ปลอดภัยด้วยกล้อง CCTV และระบบคีย์การ์ด 24 ชม.',
        pet_friendly = 1,
        has_parking = 1,
        has_air_con = 1,
        has_wifi = 1,
        has_lan = 1,
        promptpay_number = '0812345678',
        promptpay_name = 'หอพักเกษตร 2',
        water_rate = 18.00,
        electricity_rate = 8.00
      WHERE id = ${existingProfile[0].id}
    `;
  } else {
    await sql`
      INSERT INTO dormitory_profile (name, address, phone, dorm_id, cover_image, description, pet_friendly, has_parking, has_air_con, has_wifi, has_lan, promptpay_number, promptpay_name, water_rate, electricity_rate)
      VALUES ('หอพักเกษตร 2 (ม.พะเยา)', '123 หมู่ 6 ต.แม่กา อ.เมือง จ.พะเยา 56000', '081-234-5678', 1, '/up-logo.png', 'หอพักเกษตร 2 คุณภาพเยี่ยม', 1, 1, 1, 1, 1, '0812345678', 'หอพักเกษตร 2', 18.00, 8.00)
    `;
  }

  // 3. Users Seeding
  console.log('Seeding Users...');
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const usersList = [
    { name: 'เจ้าของหอพักเกษตร 2', email: 'owner@kaset2.com', role: 'owner', sub_role: null },
    { name: 'ป้าประนอม ผู้ดูแล', email: 'keeper@kaset2.com', role: 'keeper', sub_role: 'maid' },
    { name: 'ช่างสมศักดิ์ ซ่อมบำรุง', email: 'tech@kaset2.com', role: 'keeper', sub_role: 'technician' },
    { name: 'นายณัฐพล ใจดี', email: 'tenant@kaset2.com', role: 'tenant', sub_role: null },
    { name: 'นายสมชาย รักเรียน', email: 'somchai@test.com', role: 'tenant', sub_role: null },
    { name: 'นางสาวสมหญิง สดใส', email: 'somying@test.com', role: 'tenant', sub_role: null },
    { name: 'นายอนันต์ ผู้ดูแลระบบ', email: 'admin@kaset2.com', role: 'platform_admin', sub_role: null },
  ];

  for (const u of usersList) {
    const existing = await sql`SELECT id FROM users WHERE email = ${u.email} LIMIT 1`;
    if (existing.length > 0) {
      await sql`UPDATE users SET name = ${u.name}, password = ${passwordHash}, role = ${u.role}, sub_role = ${u.sub_role} WHERE email = ${u.email}`;
    } else {
      await sql`INSERT INTO users (name, email, password, role, sub_role) VALUES (${u.name}, ${u.email}, ${passwordHash}, ${u.role}, ${u.sub_role})`;
    }
  }

  // 4. Rooms Seeding (15 rooms)
  console.log('Seeding Rooms...');
  const roomsList = [
    { room_number: '101', floor: 1, room_type: 'Standard Air', price: 3500, status: 'Occupied' },
    { room_number: '102', floor: 1, room_type: 'Standard Air', price: 3500, status: 'Occupied' },
    { room_number: '103', floor: 1, room_type: 'Standard Air', price: 3500, status: 'Available' },
    { room_number: '104', floor: 1, room_type: 'Deluxe Air', price: 3800, status: 'Available' },
    { room_number: '105', floor: 1, room_type: 'Standard Fan', price: 2800, status: 'Available' },
    { room_number: '201', floor: 2, room_type: 'Deluxe Air', price: 3800, status: 'Occupied' },
    { room_number: '202', floor: 2, room_type: 'Deluxe Air', price: 3800, status: 'Available' },
    { room_number: '203', floor: 2, room_type: 'Standard Air', price: 3500, status: 'Available' },
    { room_number: '204', floor: 2, room_type: 'Standard Air', price: 3500, status: 'Available' },
    { room_number: '205', floor: 2, room_type: 'Standard Fan', price: 2800, status: 'Available' },
    { room_number: '301', floor: 3, room_type: 'VIP Studio', price: 4200, status: 'Available' },
    { room_number: '302', floor: 3, room_type: 'Deluxe Air', price: 3800, status: 'Available' },
    { room_number: '303', floor: 3, room_type: 'Standard Air', price: 3500, status: 'Available' },
    { room_number: '304', floor: 3, room_type: 'Standard Air', price: 3500, status: 'Available' },
    { room_number: '305', floor: 3, room_type: 'Standard Fan', price: 2800, status: 'Available' },
  ];

  for (const r of roomsList) {
    const existing = await sql`SELECT id FROM rooms WHERE room_number = ${r.room_number} AND dorm_id = 1 LIMIT 1`;
    if (existing.length > 0) {
      await sql`UPDATE rooms SET room_type = ${r.room_type}, price = ${r.price}, status = ${r.status}, floor = ${r.floor} WHERE id = ${existing[0].id}`;
    } else {
      await sql`INSERT INTO rooms (room_number, floor, room_type, price, status, dorm_id) VALUES (${r.room_number}, ${r.floor}, ${r.room_type}, ${r.price}, ${r.status}, 1)`;
    }
  }

  // 5. Tenants & Contracts
  console.log('Seeding Tenants & Contracts...');
  const tenantUser = (await sql`SELECT id FROM users WHERE email = 'tenant@kaset2.com' LIMIT 1`)[0];
  const somchaiUser = (await sql`SELECT id FROM users WHERE email = 'somchai@test.com' LIMIT 1`)[0];
  const somyingUser = (await sql`SELECT id FROM users WHERE email = 'somying@test.com' LIMIT 1`)[0];

  const room201 = (await sql`SELECT id FROM rooms WHERE room_number = '201' LIMIT 1`)[0];
  const room101 = (await sql`SELECT id FROM rooms WHERE room_number = '101' LIMIT 1`)[0];
  const room102 = (await sql`SELECT id FROM rooms WHERE room_number = '102' LIMIT 1`)[0];

  // Insert or update tenants
  const seedTenants = [
    { user_id: tenantUser.id, room_id: room201.id, name: 'นายณัฐพล ใจดี', email: 'tenant@kaset2.com', phone: '083-456-7890' },
    { user_id: somchaiUser.id, room_id: room101.id, name: 'นายสมชาย รักเรียน', email: 'somchai@test.com', phone: '088-888-8888' },
    { user_id: somyingUser.id, room_id: room102.id, name: 'นางสาวสมหญิง สดใส', email: 'somying@test.com', phone: '089-999-9999' },
  ];

  for (const t of seedTenants) {
    const existing = await sql`SELECT id FROM tenants WHERE email = ${t.email} LIMIT 1`;
    if (existing.length > 0) {
      await sql`UPDATE tenants SET name = ${t.name}, room_id = ${t.room_id}, phone = ${t.phone}, user_id = ${t.user_id}, status = 'Active', dorm_id = 1 WHERE id = ${existing[0].id}`;
    } else {
      await sql`INSERT INTO tenants (user_id, room_id, name, email, phone, status, dorm_id) VALUES (${t.user_id}, ${t.room_id}, ${t.name}, ${t.email}, ${t.phone}, 'Active', 1)`;
    }
  }

  // 6. Bills Seeding
  console.log('Seeding Bills...');
  const natapholTenant = (await sql`SELECT id FROM tenants WHERE email = 'tenant@kaset2.com' LIMIT 1`)[0];
  
  await sql`DELETE FROM bills WHERE tenant_id = ${natapholTenant.id}`;
  await sql`
    INSERT INTO bills (tenant_id, title, amount, billing_cycle, due_date, status, room_number, dorm_id, water_units, electric_units, water_amount, electric_amount, room_amount)
    VALUES 
    (${natapholTenant.id}, 'บิลค่าเช่าและค่าน้ำ-ไฟ ประจำเดือน สิงหาคม 2569', 4380.00, 'สิงหาคม 2569', '2026-08-31', 'Unpaid', '201', 1, 5, 60, 90.00, 480.00, 3800.00),
    (${natapholTenant.id}, 'บิลค่าเช่าและค่าน้ำ-ไฟ ประจำเดือน กรกฎาคม 2569', 4300.00, 'กรกฎาคม 2569', '2026-07-31', 'Paid', '201', 1, 4, 50, 72.00, 400.00, 3800.00)
  `;

  // 7. Maintenance Requests
  console.log('Seeding Maintenance Requests...');
  await sql`DELETE FROM maintenance_requests WHERE tenant_id = ${natapholTenant.id}`;
  await sql`
    INSERT INTO maintenance_requests (tenant_id, room_number, issue_type, description, status)
    VALUES 
    (${natapholTenant.id}, '201', 'เครื่องปรับอากาศ', 'แอร์มีน้ำหยดและไม่ค่อยเย็น รบกวนช่างเข้ามาล้างแอร์ครับ', 'InProgress'),
    (${natapholTenant.id}, '201', 'สุขภัณฑ์/ห้องน้ำ', 'ลูกบิดฝักบัวหลวม', 'Completed')
  `;

  // 8. Keepers
  console.log('Seeding Keepers...');
  const keeperUser = (await sql`SELECT id FROM users WHERE email = 'keeper@kaset2.com' LIMIT 1`)[0];
  const techUser = (await sql`SELECT id FROM users WHERE email = 'tech@kaset2.com' LIMIT 1`)[0];
  
  try {
    await sql`DELETE FROM keepers WHERE user_id IN (${keeperUser.id}, ${techUser.id})`;
    await sql`
      INSERT INTO keepers (user_id, name, phone, sub_role, status, dorm_id)
      VALUES 
      (${keeperUser.id}, 'ป้าประนอม ผู้ดูแล', '082-345-6789', 'maid', 'Active', 1),
      (${techUser.id}, 'ช่างสมศักดิ์ ซ่อมบำรุง', '085-678-9012', 'technician', 'Active', 1)
    `;
  } catch (e) { /* ignore if keepers table schema varies */ }

  // 9. Booking Progress
  console.log('Seeding Booking Requests...');
  try {
    await sql`
      INSERT INTO booking_progress (dorm_id, room_id, guest_name, guest_phone, guest_email, checkin_date, status)
      VALUES (1, ${room103 ? room103.id : 3}, 'นายธีรภัทร มีสุข', '089-111-2222', 'guest@example.com', '2026-09-01', 'Pending')
    `;
  } catch (e) { /* ignore */ }

  console.log('\n🎉 COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY!');
})();
