import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function seed() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    const resDorm = await sql`SELECT id, name FROM dormitory_profile WHERE name ILIKE '%tetsdom%' OR name ILIKE '%testdom%' LIMIT 1`;
    if (resDorm.length === 0) {
      console.log('Dorm "testdom" not found.');
      return;
    }
    
    const dormId = resDorm[0].id;
    console.log(`Found Dorm: ${resDorm[0].name} (ID: ${dormId})`);
    
    // Dormitory Rules
    const rules = [
        { title: 'การชำระค่าเช่า', content: 'กรุณาชำระค่าเช่าและค่าใช้จ่ายอื่นๆ ภายในวันที่ 5 ของทุกเดือน หากล่าช้าจะมีค่าปรับวันละ 100 บาท', order_index: 1 },
        { title: 'การใช้เสียง', content: 'งดส่งเสียงดังรบกวนผู้อื่นในเวลา 22:00 น. ถึง 07:00 น. เพื่อความสงบเรียบร้อย', order_index: 2 },
        { title: 'ความสะอาด', content: 'ห้ามนำขยะมาทิ้งไว้หน้าห้องพัก กรุณานำขยะไปทิ้งที่จุดทิ้งขยะส่วนกลางด้านล่างอาคารเท่านั้น', order_index: 3 },
        { title: 'สัตว์เลี้ยง', content: 'อนุญาตให้เลี้ยงเฉพาะแมว ไม่เกิน 1 ตัวต่อห้อง และต้องดูแลเรื่องความสะอาดและเสียงรบกวนเป็นพิเศษ', order_index: 4 },
        { title: 'การสูบบุหรี่', content: 'ห้ามสูบบุหรี่ภายในห้องพักและบริเวณระเบียงโดยเด็ดขาด กรุณาสูบในพื้นที่ที่จัดไว้ให้เท่านั้น', order_index: 5 },
        { title: 'บุคคลภายนอก', content: 'ไม่อนุญาตให้บุคคลภายนอกที่ไม่ได้ลงทะเบียนเข้าพักค้างคืน หากพบฝ่าฝืนมีค่าปรับ 500 บาท/คืน', order_index: 6 },
    ];
    
    for (const r of rules) {
        await sql`
            INSERT INTO dormitory_rules (dorm_id, title, content, order_index) 
            VALUES (${dormId}, ${r.title}, ${r.content}, ${r.order_index})
        `;
    }
    console.log(`Inserted ${rules.length} dormitory rules`);

  } catch (err) {
    console.error('Error:', err);
  }
}

seed();
