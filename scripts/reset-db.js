const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function resetDatabase() {
  const sql = neon(process.env.DATABASE_URL);
  console.log('--- Starting Global Database Reset ---');

  try {
    // 1. Reset ALL rooms to Available
    const roomsTask = sql`UPDATE rooms SET status = 'Available'`;
    console.log('✓ Setting all rooms to Available...');

    // 2. Delete ALL booking related history
    const contractsTask = sql`DELETE FROM contracts`;
    const bookingProgressTask = sql`DELETE FROM booking_progress`;
    const billsTask = sql`DELETE FROM bills`;
    const maintenanceTask = sql`DELETE FROM maintenance_requests`;
    console.log('✓ Deleting contracts, progress, bills, and maintenance requests...');

    // 3. Reset ALL tenants back to guests
    const usersTask = sql`UPDATE users SET role = 'guest' WHERE role = 'tenant'`;
    console.log('✓ Reverting all tenants to guest role...');

    // 4. Clear tenants table if it exists
    const tenantsTask = sql`DELETE FROM tenants`.catch(e => null);

    await Promise.all([
      roomsTask, 
      contractsTask, 
      bookingProgressTask, 
      billsTask, 
      maintenanceTask, 
      usersTask, 
      tenantsTask
    ]);

    console.log('--- Reset Complete! ---');
    console.log('Database is now clean and all rooms are available for testing.');
  } catch (error) {
    console.error('Reset failed:', error);
  }
}

resetDatabase();
