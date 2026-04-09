const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function setupSubscriptionSystem() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🚀 Setting up Subscription Tables...');

    // 1. Packages Table
    await sql`
      CREATE TABLE IF NOT EXISTS dormitory_packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        max_rooms INTEGER NOT NULL,
        features JSONB,
        duration_days INTEGER DEFAULT 30
      )
    `;
    
    // 2. Subscriptions Table
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER REFERENCES users(id),
        package_id INTEGER REFERENCES dormitory_packages(id),
        status VARCHAR(50) DEFAULT 'Active',
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. Seed Packages
    console.log('--- Seeding Packages ---');
    const packages = [
      { 
        name: 'Starter', 
        price: 0, 
        max_rooms: 10, 
        features: JSON.stringify(['จัดการได้สูงสุด 10 ห้อง', 'ระบบจัดการผู้เช่าพื้นฐาน', 'รายงานสรุปบิลประจำเดือน']) 
      },
      { 
        name: 'Professional', 
        price: 990, 
        max_rooms: 50, 
        features: JSON.stringify(['จัดการได้สูงสุด 50 ห้อง', 'ระบบแจ้งซ่อมอัตโนมัติ', 'ระบบบัญชีเต็มรูปแบบ', 'Line Notification สำหรับผู้เช่า']) 
      },
      { 
        name: 'Enterprise', 
        price: 2490, 
        max_rooms: 999, 
        features: JSON.stringify(['ไม่จำกัดจำนวนห้อง', 'ทุกฟีเจอร์จาก Pro', 'ซัพพอร์ตระดับ VIP 24/7', 'ระบบจองห้องออนไลน์ผ่านเว็บ (White Label)']) 
      }
    ];

    for (const p of packages) {
      await sql`
        INSERT INTO dormitory_packages (name, price, max_rooms, features)
        VALUES (${p.name}, ${p.price}, ${p.max_rooms}, ${p.features}::jsonb)
        ON CONFLICT (name) DO UPDATE SET 
          price = EXCLUDED.price, 
          max_rooms = EXCLUDED.max_rooms, 
          features = EXCLUDED.features
      `;
    }

    console.log('✅ Subscription system setup complete!');
  } catch (err) {
    console.error('❌ Error setting up subscription system:', err);
  }
}

setupSubscriptionSystem();
