const { neon } = require('@neondatabase/serverless');

async function testConnection() {
  const connectionString = 'postgresql://neondb_owner:npg_FXGn3mzEvN1b@ep-damp-unit-an0uj9wg-pooler.c-6.us-east-1.aws.neon.tech/smartdomdb?sslmode=require&channel_binding=require';
  const sql = neon(connectionString);
  
  try {
    console.log('Testing connection to Neon Postgres...');
    const result = await sql`SELECT version()`;
    console.log('Connection successful!');
    console.log('Postgres version:', result[0].version);
  } catch (error) {
    console.error('Error connecting to Neon database:', error.message);
  }
}

testConnection();
