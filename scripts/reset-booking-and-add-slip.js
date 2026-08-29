const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection('mysql://smartdom:smartdom@kritsakorn.thddns.net:5994/smartdomdb');
  
  // 1. Add slip_url column to contracts if missing
  try {
    await conn.query('ALTER TABLE contracts ADD COLUMN slip_url LONGTEXT');
    console.log('✅ Added slip_url column to contracts table');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ slip_url column already exists');
    } else {
      console.log('Error adding column:', e.message);
    }
  }

  // 2. Cancel any pending booking (status = 'PendingOwnerSignature') and set rooms back to Available
  const [pending] = await conn.query("SELECT id, room_id FROM contracts WHERE status = 'PendingOwnerSignature'");
  for (const p of pending) {
    await conn.query('DELETE FROM contracts WHERE id = ?', [p.id]);
    await conn.query("UPDATE rooms SET status = 'Available' WHERE id = ?", [p.room_id]);
    await conn.query('DELETE FROM booking_progress WHERE room_id = ?', [p.room_id]);
    console.log(`✅ Cancelled contract #${p.id} and set room #${p.room_id} to Available`);
  }

  // Also ensure Room 45 is Available
  await conn.query("UPDATE rooms SET status = 'Available' WHERE id = 45");
  console.log('✅ Room 45 status verified as Available');

  await conn.end();
}

run().catch(console.error);
