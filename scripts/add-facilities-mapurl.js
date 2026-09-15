const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');
  console.log('Connected to MySQL. Checking columns of dormitory_profile...');

  const [cols] = await conn.execute('DESCRIBE dormitory_profile');
  const colNames = cols.map(c => c.Field);

  if (!colNames.includes('facilities')) {
    console.log('Adding facilities column to dormitory_profile...');
    await conn.execute('ALTER TABLE dormitory_profile ADD COLUMN facilities TEXT NULL');
    console.log('✅ Added facilities column.');
  } else {
    console.log('facilities column already exists.');
  }

  if (!colNames.includes('map_url')) {
    console.log('Adding map_url column to dormitory_profile...');
    await conn.execute('ALTER TABLE dormitory_profile ADD COLUMN map_url VARCHAR(500) NULL');
    console.log('✅ Added map_url column.');
  } else {
    console.log('map_url column already exists.');
  }

  const [updatedCols] = await conn.execute('DESCRIBE dormitory_profile');
  console.log('Updated columns:', updatedCols.map(c => c.Field));

  await conn.end();
}

migrate().catch(console.error);
