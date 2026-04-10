const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function addSignatureColumn() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('Adding signature and contract_terms columns to contracts table...');
    await sql`
      ALTER TABLE contracts 
      ADD COLUMN IF NOT EXISTS signature TEXT,
      ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS contract_terms TEXT
    `;
    console.log('Update complete!');
  } catch (err) {
    console.error('Error updating table:', err);
  }
}

addSignatureColumn();
