const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createTrialTenant() {
  const sql = neon(process.env.DATABASE_URL);
  
  const trialEmail = 'tenant_trial@smartdom.com';
  const trialPassword = 'password123';
  const trialName = 'ผู้เช่า ทดลองระบบ';
  const role = 'tenant';

  try {
    console.log('--- Creating Trial Tenant Account ---');
    
    // 1. Check if user already exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${trialEmail}`;
    if (existingUser.length > 0) {
        console.log('Trial account already exists. Updating password and resetting role...');
        const hashedPassword = await bcrypt.hash(trialPassword, 10);
        await sql`UPDATE users SET password = ${hashedPassword}, role = ${role} WHERE email = ${trialEmail}`;
        console.log('Login Email:', trialEmail);
        console.log('New Password:', trialPassword);
        console.log('Role Reset:', role);
        return;
    }

    // 2. Find an available room
    const availableRooms = await sql`SELECT id, room_number FROM rooms WHERE status = 'Available' LIMIT 1`;
    if (availableRooms.length === 0) {
        console.error('Error: No available rooms found to assign the trial tenant.');
        return;
    }
    const roomId = availableRooms[0].id;
    const roomNumber = availableRooms[0].room_number;

    // 3. Create User
    const hashedPassword = await bcrypt.hash(trialPassword, 10);
    const userResult = await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${trialName}, ${trialEmail}, ${hashedPassword}, ${role})
      RETURNING id
    `;
    const userId = userResult[0].id;
    console.log('User created with ID:', userId);

    // 4. Create Tenant entry
    await sql`
      INSERT INTO tenants (user_id, name, email, room_id, status)
      VALUES (${userId}, ${trialName}, ${trialEmail}, ${roomId}, 'Active')
    `;
    
    // 5. Update Room status
    await sql`UPDATE rooms SET status = 'Occupied' WHERE id = ${roomId}`;

    // 6. Create a mock bill and announcement for testing
    await sql`
      INSERT INTO bills (tenant_id, title, amount, billing_cycle, due_date, status)
      SELECT t.id, 'ค่าเช่าห้องทดลอง', 5500.00, 'ตุลาคม 2569', CURRENT_DATE + INTERVAL '5 days', 'Unpaid'
      FROM tenants t WHERE t.email = ${trialEmail}
    `;

    console.log('\nSuccess! Trial account created successfully:');
    console.log('-------------------------------------------');
    console.log('Email:    ', trialEmail);
    console.log('Password: ', trialPassword);
    console.log('Assigned Room: ', roomNumber);
    console.log('Role:     ', role);
    console.log('-------------------------------------------');
    console.log('You can now log in using these credentials.');

  } catch (err) {
    console.error('Error creating trial tenant:', err);
  }
}

createTrialTenant();
