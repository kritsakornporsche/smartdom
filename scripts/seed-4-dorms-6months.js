const bcrypt = require('bcryptjs');
const { neon } = require('../lib/mysql-adapter');
require('dotenv').config({ path: '.env.local' });

// Thai Realistic Names Generator
const FIRST_NAMES_MALE = ['กิตติศักดิ์', 'ณัฐพล', 'ธนกฤต', 'พงศกร', 'ภูวนาท', 'วรวิทย์', 'ศุภกร', 'อนันต์', 'เอกชัย', 'ปณิธาน', 'ธีรภัทร', 'ชานนท์', 'พีรพัฒน์', 'สิทธิชัย', 'กฤษฎา', 'ปิยะวัฒน์', 'วริทธิ์', 'อภิสิทธิ์', 'นวพล', 'ชัชวาล', 'เกียรติศักดิ์', 'จิรวัฒน์', 'ธนพล', 'พงศ์พิพัฒน์', 'ยุรนันท์', 'รณชัย', 'วิศรุต', 'สรรเสริญ', 'อธิป', 'อมรเทพ'];
const FIRST_NAMES_FEMALE = ['กนกวรรณ', 'จิราภรณ์', 'ชลธิชา', 'ณิชาภัทร', 'ทิพวรรณ', 'ธันยพร', 'นฤมล', 'ปิยะฉัตร', 'พรพิศ', 'มนัสวี', 'รุ่งทิพย์', 'วรรณภา', 'ศิริพร', 'สุนิสา', 'อนงค์นาฏ', 'อรอนงค์', 'เกศรินทร์', 'ชนัญชิดา', 'ธัญญารัตน์', 'นิภาพร', 'เบญจวรรณ', 'ปรียานุช', 'พิมลวรรณ', 'ภัทราภรณ์', 'ยุพาพร', 'รัตนาภรณ์', 'ศศิธร', 'สุพรรษา', 'อารียา', 'อัจฉรา'];
const LAST_NAMES = ['ใจดี', 'สมบูรณ์', 'รักเรียน', 'สดใส', 'มีสุข', 'เจริญสุข', 'มั่นคง', 'ทองดี', 'วงศ์สุวรรณ', 'ศรีสวัสดิ์', 'พงษ์พานิช', 'แสงสว่าง', 'บุญเรือง', 'สุขเกษม', 'คำปัญญา', 'ไชยวงศ์', 'ตันติวิทย์', 'สุวรรณศรี', 'จันทร์หอม', 'รัตนโชติ', 'มงคลรัตน์', 'ชัยชนะ', 'มิ่งขวัญ', 'สิทธิโชค', 'วัฒนพาณิชย์', 'เกียรติขจร', 'พัฒนศักดิ์', 'ชื่นชม', 'วรวงศ์', 'คงกระพัน'];

const MONTHS_DATA = [
  { monthNum: 3, name: 'มีนาคม 2569', cycle: 'มีนาคม 2569', dueDate: '2026-03-31', status: 'Paid' },
  { monthNum: 4, name: 'เมษายน 2569', cycle: 'เมษายน 2569', dueDate: '2026-04-30', status: 'Paid' },
  { monthNum: 5, name: 'พฤษภาคม 2569', cycle: 'พฤษภาคม 2569', dueDate: '2026-05-31', status: 'Paid' },
  { monthNum: 6, name: 'มิถุนายน 2569', cycle: 'มิถุนายน 2569', dueDate: '2026-06-30', status: 'Paid' },
  { monthNum: 7, name: 'กรกฎาคม 2569', cycle: 'กรกฎาคม 2569', dueDate: '2026-07-31', status: 'Paid' },
  { monthNum: 8, name: 'สิงหาคม 2569', cycle: 'สิงหาคม 2569', dueDate: '2026-08-31', status: 'Current' }
];

const ISSUE_TYPES = [
  { type: 'เครื่องปรับอากาศ', descs: ['แอร์ไม่เย็น มีแต่ลม', 'แอร์มีน้ำหยดลงเตียง', 'รีโมทแอร์กดไม่ติด', 'แอร์มีเสียงดังผิดปกติ'] },
  { type: 'สุขภัณฑ์/ห้องน้ำ', descs: ['ชักโครกกดไม่ลง น้ำไหลช้า', 'สายชำระรั่วซึม', 'ฝักบัวน้ำไหลเบามาก', 'ท่อน้ำทิ้งในห้องน้ำตัน'] },
  { type: 'ระบบไฟฟ้าและหลอดไฟ', descs: ['หลอดไฟระเบียงกะพริบดับ', 'ปลั๊กไฟข้างเตียงเสียบไม่ติด', 'เครื่องทำน้ำอุ่นไฟไม่เข้า', 'เบรกเกอร์ตัดเอง'] },
  { type: 'อินเทอร์เน็ต/Wi-Fi', descs: ['สัญญาณ Wi-Fi หลุดบ่อยมาก', 'ช่องเสียบสาย LAN หน้าโต๊ะหลวม', 'เน็ตช้าผิดปกติช่วงค่ำ'] },
  { type: 'ประตู/หน้าต่าง/เฟอร์นิเจอร์', descs: ['ลูกบิดประตูล็อกยาก', 'บานพับตู้เสื้อผ้าหลุด', 'มุ้งลวดหน้าต่างขาด', 'โต๊ะเขียนหนังสือขาโยก'] }
];

(async () => {
  console.log('🚀 STARTING 6-MONTH MULTI-DORMITORY SIMULATION ENGINE...');
  const sql = neon(process.env.DATABASE_URL);
  const commonPassword = await bcrypt.hash('Password123!', 10);

  // -------------------------------------------------------------
  // 1. Definition of 3 Owners and 4 Dormitories
  // -------------------------------------------------------------
  const DORMS_CONFIG = [
    {
      dorm_id: 1,
      dorm_name: 'หอพักเกษตร 2 (ม.พะเยา)',
      db_name: 'smartdom_dorm_1',
      owner_name: 'คุณกฤษณะ เกษตรสมบูรณ์',
      owner_email: 'owner@kaset2.com',
      owner_phone: '081-234-5678',
      address: '123 หมู่ 6 ถนนพหลโยธิน ต.แม่กา อ.เมือง จ.พะเยา 56000 (หน้า ม.พะเยา)',
      promptpay_number: '0812345678',
      water_rate: 18.00,
      electricity_rate: 8.00,
      total_rooms: 32,
      active_tenants_count: 28,
      keepers: [
        { name: 'ป้าประนอม ผู้ดูแล', email: 'keeper@kaset2.com', phone: '082-345-6789', role: 'keeper', sub_role: 'maid' },
        { name: 'ช่างสมศักดิ์ ซ่อมบำรุง', email: 'tech@kaset2.com', phone: '085-678-9012', role: 'keeper', sub_role: 'technician' },
        { name: 'พี่สมใจ แม่บ้านประจำตึก', email: 'somjai@kaset2.com', phone: '089-777-1111', role: 'keeper', sub_role: 'maid' }
      ]
    },
    {
      dorm_id: 2,
      dorm_name: 'หอพักเกษตรพรีเมียร์ (Kaset Premier)',
      db_name: 'smartdom_dorm_2',
      owner_name: 'คุณกฤษณะ เกษตรสมบูรณ์', // Same Owner 1 (Multiple Dorms)
      owner_email: 'owner@kaset2.com',
      owner_phone: '081-234-5678',
      address: '188 หมู่ 6 ซอยเสริมสุข ต.แม่กา อ.เมือง จ.พะเยา 56000',
      promptpay_number: '0812345678',
      water_rate: 20.00,
      electricity_rate: 8.00,
      total_rooms: 24,
      active_tenants_count: 21,
      keepers: [
        { name: 'ป้ามาลี ดูแลอาคารพรีเมียร์', email: 'malee@premier.com', phone: '084-555-1234', role: 'keeper', sub_role: 'maid' },
        { name: 'ช่างวิรัช ระบบอาคาร', email: 'wirat@premier.com', phone: '086-666-5678', role: 'keeper', sub_role: 'technician' }
      ]
    },
    {
      dorm_id: 3,
      dorm_name: 'หอพักภูคำวิลล่า (Phukham Villa หน้า ม.พะเยา)',
      db_name: 'smartdom_dorm_3',
      owner_name: 'คุณวิชัย ภูคำเจริญ', // Owner 2
      owner_email: 'owner2@phukham.com',
      owner_phone: '089-888-9999',
      address: '99/1-10 หมู่ 2 ประตูกลาง ม.พะเยา ต.แม่กา อ.เมือง จ.พะเยา 56000',
      promptpay_number: '0898889999',
      water_rate: 18.00,
      electricity_rate: 7.50,
      total_rooms: 50,
      active_tenants_count: 45,
      keepers: [
        { name: 'ป้าบัวคำ แม่บ้านกะเช้า', email: 'buakham@phukham.com', phone: '081-111-2233', role: 'keeper', sub_role: 'maid' },
        { name: 'ป้าจันทร์ แม่บ้านกะบ่าย', email: 'jan@phukham.com', phone: '082-222-3344', role: 'keeper', sub_role: 'maid' },
        { name: 'ช่างประสิทธิ์ หัวหน้าช่างไฟฟ้า', email: 'prasit@phukham.com', phone: '083-333-4455', role: 'keeper', sub_role: 'technician' },
        { name: 'ช่างมนัส ช่างประปาและแอร์', email: 'manat@phukham.com', phone: '084-444-5566', role: 'keeper', sub_role: 'technician' }
      ]
    },
    {
      dorm_id: 4,
      dorm_name: 'หอพักเวียงพะเยาเพลส (Wiang Phayao Place)',
      db_name: 'smartdom_dorm_4',
      owner_name: 'คุณพรทิพย์ เวียงพะเยา', // Owner 3
      owner_email: 'owner3@wiangplace.com',
      owner_phone: '087-777-8888',
      address: '55/5 ซอยสุขเกษม หน้า ม.พะเยา ต.แม่กา อ.เมือง จ.พะเยา 56000',
      promptpay_number: '0877778888',
      water_rate: 18.00,
      electricity_rate: 8.00,
      total_rooms: 40,
      active_tenants_count: 36,
      keepers: [
        { name: 'ป้าสายหยุด แม่บ้านเวียงพะเยา', email: 'saiyud@wiangplace.com', phone: '085-555-6677', role: 'keeper', sub_role: 'maid' },
        { name: 'ช่างเอก ประจำเวียงพะเยา', email: 'ake@wiangplace.com', phone: '086-666-7788', role: 'keeper', sub_role: 'technician' },
        { name: 'ป้าจำรัส ผู้ช่วยดูแล', email: 'jumras@wiangplace.com', phone: '087-777-9900', role: 'keeper', sub_role: 'maid' }
      ]
    }
  ];

  // -------------------------------------------------------------
  // 2. Clean & Prepare Database
  // -------------------------------------------------------------
  console.log('\n🧹 Clearing previous test simulation tables...');
  await sql`DELETE FROM bills WHERE id > 0`;
  await sql`DELETE FROM maintenance_requests WHERE id > 0`;
  await sql`DELETE FROM maintenance_jobs WHERE id > 0`;
  await sql`DELETE FROM cleaning_jobs WHERE id > 0`;
  await sql`DELETE FROM contracts WHERE id > 0`;
  await sql`DELETE FROM tenants WHERE id > 0`;
  await sql`DELETE FROM rooms WHERE id > 0`;
  await sql`DELETE FROM keepers WHERE id > 0`;
  await sql`DELETE FROM dormitory_registry WHERE id > 0`;
  await sql`DELETE FROM dormitory_profile WHERE id > 0`;

  // Seed Owners
  const ownersList = [
    { name: 'คุณกฤษณะ เกษตรสมบูรณ์ (Owner 1)', email: 'owner@kaset2.com' },
    { name: 'คุณวิชัย ภูคำเจริญ (Owner 2)', email: 'owner2@phukham.com' },
    { name: 'คุณพรทิพย์ เวียงพะเยา (Owner 3)', email: 'owner3@wiangplace.com' },
    { name: 'นายอนันต์ ผู้ดูแลระบบ', email: 'admin@kaset2.com', role: 'platform_admin' }
  ];

  for (const o of ownersList) {
    const existing = await sql`SELECT id FROM users WHERE email = ${o.email} LIMIT 1`;
    if (existing.length > 0) {
      await sql`UPDATE users SET name = ${o.name}, password = ${commonPassword}, role = ${o.role || 'owner'} WHERE id = ${existing[0].id}`;
    } else {
      await sql`INSERT INTO users (name, email, password, role) VALUES (${o.name}, ${o.email}, ${commonPassword}, ${o.role || 'owner'})`;
    }
  }

  let totalTenantsCount = 0;
  let totalBillsCount = 0;
  let totalMaintenanceCount = 0;
  let totalRoomsCount = 0;

  // -------------------------------------------------------------
  // 3. Process Each Dormitory
  // -------------------------------------------------------------
  for (const cfg of DORMS_CONFIG) {
    console.log(`\n🏢 Seeding ${cfg.dorm_name} (Dorm ID: ${cfg.dorm_id})...`);
    
    // Find Owner ID
    const ownerRow = (await sql`SELECT id FROM users WHERE email = ${cfg.owner_email} LIMIT 1`)[0];
    const ownerId = ownerRow ? ownerRow.id : 1;

    // A. Insert Registry & Profile
    await sql`
      INSERT INTO dormitory_registry (id, owner_email, owner_name, dorm_name, db_name, phone, address, status, owner_id)
      VALUES (${cfg.dorm_id}, ${cfg.owner_email}, ${cfg.owner_name}, ${cfg.dorm_name}, ${cfg.db_name}, ${cfg.owner_phone}, ${cfg.address}, 'Active', ${ownerId})
    `;

    await sql`
      INSERT INTO dormitory_profile (id, dorm_id, name, address, phone, owner_id, cover_image, description, pet_friendly, has_parking, has_air_con, has_wifi, has_lan, promptpay_number, promptpay_name, water_rate, electricity_rate)
      VALUES (${cfg.dorm_id}, ${cfg.dorm_id}, ${cfg.dorm_name}, ${cfg.address}, ${cfg.owner_phone}, ${ownerId}, '/up-logo.png', 'หอพักคุณภาพใกล้มหาวิทยาลัยพะเยา ปลอดภัย สะอาด สิ่งอำนวยความสะดวกครบครัน', 1, 1, 1, 1, 1, ${cfg.promptpay_number}, ${cfg.dorm_name}, ${cfg.water_rate}, ${cfg.electricity_rate})
    `;

    // B. Insert Keepers & Staff
    for (const k of cfg.keepers) {
      let keeperUser = (await sql`SELECT id FROM users WHERE email = ${k.email} LIMIT 1`)[0];
      if (!keeperUser) {
        const uRes = await sql`INSERT INTO users (name, email, password, role, sub_role) VALUES (${k.name}, ${k.email}, ${commonPassword}, 'keeper', ${k.sub_role})`;
        keeperUser = { id: uRes.insertId };
      } else {
        await sql`UPDATE users SET name = ${k.name}, role = 'keeper', sub_role = ${k.sub_role} WHERE id = ${keeperUser.id}`;
      }

      const position = k.sub_role === 'technician' ? 'Technician' : 'Maid';
      await sql`
        INSERT INTO keepers (user_id, name, email, phone, position, dorm_id)
        VALUES (${keeperUser.id}, ${k.name}, ${k.email}, ${k.phone}, ${position}, ${cfg.dorm_id})
      `;
    }

    // C. Generate Rooms (Floors 1-5)
    console.log(`   - Generating ${cfg.total_rooms} rooms...`);
    const roomsCreated = [];
    const roomsPerFloor = Math.ceil(cfg.total_rooms / 4);

    for (let i = 1; i <= cfg.total_rooms; i++) {
      const floor = Math.floor((i - 1) / roomsPerFloor) + 1;
      const roomIndex = ((i - 1) % roomsPerFloor) + 1;
      const room_number = `${floor}${roomIndex.toString().padStart(2, '0')}`;
      
      let room_type = 'Standard Air';
      let price = 3500;
      if (floor === 1 && roomIndex <= 2) {
        room_type = 'Standard Fan';
        price = 2800;
      } else if (roomIndex >= 7) {
        room_type = 'Deluxe Air';
        price = 3900;
      }

      const isOccupied = i <= cfg.active_tenants_count;
      const status = isOccupied ? 'Occupied' : (i === cfg.active_tenants_count + 1 ? 'Maintenance' : 'Available');

      const roomRes = await sql`
        INSERT INTO rooms (room_number, floor, room_type, price, status, dorm_id)
        VALUES (${room_number}, ${floor}, ${room_type}, ${price}, ${status}, ${cfg.dorm_id})
      `;
      const roomId = roomRes.insertId;
      roomsCreated.push({ id: roomId, room_number, floor, room_type, price, status, isOccupied });
      totalRoomsCount++;
    }

    // D. Generate Tenants & 6 Months Historical Bills & Maintenance
    console.log(`   - Generating ${cfg.active_tenants_count} tenants & 6-month historical billing...`);
    for (let t = 1; t <= cfg.active_tenants_count; t++) {
      const room = roomsCreated[t - 1];
      const isMale = t % 2 === 0;
      const fName = isMale ? FIRST_NAMES_MALE[(t + cfg.dorm_id * 5) % FIRST_NAMES_MALE.length] : FIRST_NAMES_FEMALE[(t + cfg.dorm_id * 7) % FIRST_NAMES_FEMALE.length];
      const lName = LAST_NAMES[(t * 3 + cfg.dorm_id) % LAST_NAMES.length];
      const fullName = `${isMale ? 'นาย' : 'นางสาว'}${fName} ${lName}`;
      const email = `tenant_d${cfg.dorm_id}_r${room.room_number}@smartdom.ac.th`;
      const phone = `08${Math.floor(10000000 + Math.random() * 90000000)}`;

      // Special named accounts for testing on Dorm 1
      let tenantEmail = email;
      let tenantName = fullName;
      if (cfg.dorm_id === 1 && t === 1) {
        tenantEmail = 'tenant@kaset2.com';
        tenantName = 'นายณัฐพล ใจดี (ผู้เช่าห้อง 201)';
      } else if (cfg.dorm_id === 1 && t === 2) {
        tenantEmail = 'somchai@test.com';
        tenantName = 'นายสมชาย รักเรียน';
      }

      // User record
      let tUser = (await sql`SELECT id FROM users WHERE email = ${tenantEmail} LIMIT 1`)[0];
      if (!tUser) {
        const uRes = await sql`INSERT INTO users (name, email, password, role) VALUES (${tenantName}, ${tenantEmail}, ${commonPassword}, 'tenant')`;
        tUser = { id: uRes.insertId };
      } else {
        await sql`UPDATE users SET name = ${tenantName}, role = 'tenant' WHERE id = ${tUser.id}`;
      }

      // Tenant record
      const tenRes = await sql`
        INSERT INTO tenants (user_id, room_id, name, email, phone, status, dorm_id)
        VALUES (${tUser.id}, ${room.id}, ${tenantName}, ${tenantEmail}, ${phone}, 'Active', ${cfg.dorm_id})
      `;
      const tenantId = tenRes.insertId;
      totalTenantsCount++;

      // Contract record (Active 1-Year Contract signed in March 2026)
      await sql`
        INSERT INTO contracts (tenant_id, room_id, start_date, end_date, deposit_amount, status, signed_at, contract_terms)
        VALUES (${tenantId}, ${room.id}, '2026-03-01', '2027-02-28', ${room.price * 2}, 'Active', '2026-03-01 10:00:00', 'สัญญาเช่าห้องพักมาตรฐาน 1 ปี มหาวิทยาลัยพะเยา')
      `;

      // 6 Months Bills (March to August 2026)
      let baseWaterMeter = 100 + t * 10;
      let baseElectricMeter = 500 + t * 50;

      for (let m = 0; m < MONTHS_DATA.length; m++) {
        const mData = MONTHS_DATA[m];
        const waterUnits = Math.floor(4 + (Math.sin(t + m) + 1) * 3); // 4-10 units
        const electricUnits = Math.floor(50 + (Math.cos(t * 2 + m) + 1) * 35); // 50-120 units

        const waterAmount = waterUnits * cfg.water_rate;
        const electricAmount = electricUnits * cfg.electricity_rate;
        const totalAmount = room.price + waterAmount + electricAmount;

        let billStatus = 'Paid';
        let slipUrl = '/slips/sample_bank_slip.png';

        if (mData.status === 'Current') {
          // August 2026: 75% Paid, 20% Unpaid, 5% Pending
          if (t % 5 === 0) {
            billStatus = 'Unpaid';
            slipUrl = null;
          } else if (t % 7 === 0) {
            billStatus = 'Unpaid';
            slipUrl = '/slips/sample_bank_slip.png';
          }
        }

        await sql`
          INSERT INTO bills (tenant_id, title, amount, billing_cycle, due_date, status, slip_url, room_number, dorm_id, water_units, electric_units, water_amount, electric_amount, room_amount, created_at)
          VALUES (${tenantId}, ${'บิลค่าเช่าและค่าน้ำ-ไฟ ประจำเดือน ' + mData.name}, ${totalAmount}, ${mData.cycle}, ${mData.dueDate}, ${billStatus}, ${slipUrl}, ${room.room_number}, ${cfg.dorm_id}, ${waterUnits}, ${electricUnits}, ${waterAmount}, ${electricAmount}, ${room.price}, ${'2026-0' + mData.monthNum + '-25 09:00:00'})
        `;
        totalBillsCount++;

        baseWaterMeter += waterUnits;
        baseElectricMeter += electricUnits;
      }

      // Maintenance Request for 30% of tenants across the 6 months
      if (t % 3 === 0 || t === 1) {
        const issueObj = ISSUE_TYPES[(t + cfg.dorm_id) % ISSUE_TYPES.length];
        const desc = issueObj.descs[(t * 2) % issueObj.descs.length];
        const mMonth = (t % 5) + 3; // March to July, or August
        const isCurrentMonth = mMonth === 8;
        const mStatus = isCurrentMonth ? 'InProgress' : 'Completed';

        await sql`
          INSERT INTO maintenance_requests (tenant_id, room_number, issue_type, description, status, created_at)
          VALUES (${tenantId}, ${room.room_number}, ${issueObj.type}, ${desc}, ${mStatus}, ${'2026-0' + mMonth + '-12 14:30:00'})
        `;
        totalMaintenanceCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 SIMULATION COMPLETED WITH 100% SUCCESS!');
  console.log(`🏛️ Total Dormitories : ${DORMS_CONFIG.length} (หอพักเกษตร 2, เกษตรพรีเมียร์, ภูคำวิลล่า, เวียงพะเยาเพลส)`);
  console.log(`👑 Total Owners      : 3 Accounts (owner@kaset2.com, owner2@phukham.com, owner3@wiangplace.com)`);
  console.log(`🚪 Total Rooms       : ${totalRoomsCount} Rooms across 4 dormitories`);
  console.log(`🧑‍🎓 Total Active Tenants: ${totalTenantsCount} Tenants with signed contracts`);
  console.log(`📄 Total 6-Mo Bills  : ${totalBillsCount} Monthly Invoices (Mar-Aug 2026)`);
  console.log(`🔧 Total Maintenance : ${totalMaintenanceCount} Historical Work Orders`);
  console.log('='.repeat(60));
})();
