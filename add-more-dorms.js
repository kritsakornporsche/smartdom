const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function addDormitories() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🚀 Ensuring UNIQUE constraint on dormitory_profile(name)...');
    try {
      await sql`ALTER TABLE dormitory_profile ADD CONSTRAINT dormitory_profile_name_unique UNIQUE (name)`;
    } catch (e) {
      // Ignore if constraint already exists
    }

    console.log('🚀 Adding More Dormitories...');


    const dorms = [
      {
        name: 'The Earth-Tone Suites',
        address: '123 ซอยสุขุมวิท 21 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110',
        phone: '02-123-4567',
        tax_id: '1234567890123'
      },
      {
        name: 'Minimalist Garden',
        address: '45/1 ถนนพหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
        phone: '02-987-6543',
        tax_id: '9876543210987'
      },
      {
        name: 'SmartDom Riverside',
        address: '99 ถนนเจริญกรุง แขวงวัดพระยาไกร เขตบางคอแหลม กรุงเทพฯ 10120',
        phone: '02-555-4444',
        tax_id: '5554443332221'
      }
    ];

    for (const d of dorms) {
      console.log(`Adding: ${d.name}`);
      await sql`
        INSERT INTO dormitory_profile (name, address, phone, tax_id)
        VALUES (${d.name}, ${d.address}, ${d.phone}, ${d.tax_id})
        ON CONFLICT (name) DO NOTHING
      `;
    }

    console.log('✅ Dormitories added successfully!');
    
    // List all dorms
    const allDorms = await sql`SELECT id, name, address FROM dormitory_profile`;
    console.log('\nCurrent Dormitories List:');
    allDorms.forEach(dorm => {
      console.log(`- [${dorm.id}] ${dorm.name} (${dorm.address})`);
    });

  } catch (err) {
    console.error('❌ Error adding dormitories:', err);
  }
}

addDormitories();
