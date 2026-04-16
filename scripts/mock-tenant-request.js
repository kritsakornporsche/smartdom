const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function createMockRequests() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // 1. Get a random tenant and room
    const tenants = await sql`
      SELECT id FROM users WHERE role = 'tenant' LIMIT 1
    `;
    const rooms = await sql`
      SELECT id, room_number FROM rooms LIMIT 1
    `;

    if (tenants.length === 0 || rooms.length === 0) {
      console.log('❌ ไม่พบข้อมูลผู้เช่า หรือ ห้องพัก ในระบบเลย กรุณาเพิ่มข้อมูลก่อนครับ');
      return;
    }

    const tenantId = tenants[0].id;
    const roomId = rooms[0].id;
    const roomNo = rooms[0].room_number;

    console.log(`🏠 กำลังจำลองคำขอจากผู้เช่า (User ID: ${tenantId}) สำหรับห้อง: ${roomNo}...`);

    // 2. Insert a Mock Cleaning Job
    await sql`
      INSERT INTO cleaning_jobs (room_id, job_type, status)
      VALUES (${roomId}, 'weekly', 'pending')
    `;
    console.log('✅ [ระบบแม่บ้าน] สร้างคำขอทำความสะอาดรายสัปดาห์ (รอรับงาน) สำเร็จ!');

    // 3. Insert a Mock Maintenance Job
    await sql`
      INSERT INTO maintenance_jobs (room_id, issue, urgency, status)
      VALUES (${roomId}, 'แอร์น้ำหยด ฝุ่นจับ', 'rush', 'pending')
    `;
    console.log('✅ [ระบบช่างซ่อม] สร้างคำขอแจ้งซ่อมแอร์น้ำหยดระดับ "ด่วน" (รอรับงาน) สำเร็จ!');

    console.log('\n✨ คุณสามารถรีเฟรชหน้าเว็บ Dashboard ของแม่บ้าน และ ช่างซ่อม เพื่อดูรายการใหม่ที่โผล่ขึ้นมาได้เลยครับ!');

  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
  }
}

createMockRequests();
