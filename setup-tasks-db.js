const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function setupTasksDB() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('--- Setting up Tasks/Jobs Data ---');

    console.log('Creating cleaning_jobs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS cleaning_jobs (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES rooms(id),
        status VARCHAR(50) DEFAULT 'pending',
        job_type VARCHAR(50) NOT NULL,
        assigned_to INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `;

    console.log('Creating maintenance_jobs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS maintenance_jobs (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES rooms(id),
        issue TEXT NOT NULL,
        urgency VARCHAR(50) DEFAULT 'normal',
        status VARCHAR(50) DEFAULT 'pending',
        assigned_to INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `;

    console.log('Seeding mock jobs...');
    // Seed Cleaning Jobs
    const cleaningCheck = await sql`SELECT COUNT(*) FROM cleaning_jobs`;
    if (cleaningCheck[0].count === '0') {
      const rooms = await sql`SELECT id FROM rooms LIMIT 3`;
      if (rooms.length >= 3) {
        await sql`INSERT INTO cleaning_jobs (room_id, status, job_type) VALUES (${rooms[0].id}, 'pending', 'move_out')`;
        await sql`INSERT INTO cleaning_jobs (room_id, status, job_type) VALUES (${rooms[1].id}, 'in_progress', 'weekly')`;
        await sql`INSERT INTO cleaning_jobs (room_id, status, job_type) VALUES (${rooms[2].id}, 'completed', 'requested')`;
      }
    }

    // Seed Maintenance Jobs
    const maintCheck = await sql`SELECT COUNT(*) FROM maintenance_jobs`;
    if (maintCheck[0].count === '0') {
      const rooms = await sql`SELECT id FROM rooms LIMIT 3`;
      if (rooms.length >= 3) {
        await sql`INSERT INTO maintenance_jobs (room_id, issue, urgency, status) VALUES (${rooms[0].id}, 'แอร์น้ำหยด', 'rush', 'pending')`;
        await sql`INSERT INTO maintenance_jobs (room_id, issue, urgency, status) VALUES (${rooms[1].id}, 'หลอดไฟระเบียงขาด', 'normal', 'in_progress')`;
        await sql`INSERT INTO maintenance_jobs (room_id, issue, urgency, status) VALUES (${rooms[2].id}, 'ก๊อกน้ำอ่างล้างหน้าไหลซึม', 'normal', 'waiting_parts')`;
      }
    }

    console.log('Tasks/Jobs setup complete!');
  } catch (err) {
    console.error('Error in setup-tasks-db:', err);
  }
}

setupTasksDB();
