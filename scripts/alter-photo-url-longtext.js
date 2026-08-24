const { neon } = require('../lib/mysql-adapter');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const sql = neon(process.env.DATABASE_URL);
  console.log('🚀 Altering photo_url columns to LONGTEXT for direct image file uploads...');

  await sql`ALTER TABLE cleaning_jobs MODIFY COLUMN photo_url LONGTEXT`;
  await sql`ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS photo_url LONGTEXT`;
  await sql`ALTER TABLE maintenance_requests MODIFY COLUMN photo_url LONGTEXT`;

  console.log('✅ Tables updated to support direct base64 file uploads!');
})();
