const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
async function migrate() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS announcement_reads (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id),
        announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, announcement_id)
      )
    `;
    console.log('Migration successful: created announcement_reads table');
  } catch (e) {
    console.error('Migration failed:', e);
  }
}
migrate();
