const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require');

async function diagnose() {
  console.log('=== SmartDom Database Diagnostic ===\n');

  // 1. Check connection
  try {
    const ver = await sql`SELECT version()`;
    console.log('✅ Connection OK:', ver[0].version.split(',')[0]);
  } catch (e) {
    console.error('❌ Connection FAILED:', e.message);
    process.exit(1);
  }

  // 2. List tables
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log('\n📋 Tables in database:', tables.length > 0 ? tables.map(t => t.table_name).join(', ') : '(none)');
  } catch (e) {
    console.error('❌ Table listing failed:', e.message);
  }

  // 3. Check if users table exists and its schema
  try {
    const cols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    if (cols.length > 0) {
      console.log('\n👤 users table schema:');
      cols.forEach(c => console.log(`   ${c.column_name} (${c.data_type}) nullable=${c.is_nullable}`));
    } else {
      console.log('\n⚠️  users table does NOT exist yet');
    }
  } catch (e) {
    console.error('❌ Column check failed:', e.message);
  }

  // 4. Try to create users table
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        full_name   TEXT        NOT NULL,
        email       TEXT        NOT NULL UNIQUE,
        password    TEXT        NOT NULL,
        role        TEXT        NOT NULL DEFAULT 'tenant',
        is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('\n✅ users table CREATE IF NOT EXISTS: OK');
  } catch (e) {
    console.error('\n❌ CREATE TABLE failed:', e.message);
  }

  // 5. Count users
  try {
    const count = await sql`SELECT COUNT(*) as total FROM users`;
    console.log('\n👥 Total users in DB:', count[0].total);
  } catch (e) {
    console.error('❌ User count failed:', e.message);
  }

  // 6. Test crypto (Node.js built-in)
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode('test-password');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('\n🔐 crypto.subtle.digest (SHA-256): OK →', hash.slice(0, 16) + '...');
  } catch (e) {
    console.error('\n❌ crypto.subtle FAILED:', e.message);
    console.log('   → This is likely the root cause of the error!');
  }

  console.log('\n=== Diagnostic Complete ===');
}

diagnose().catch(console.error);
