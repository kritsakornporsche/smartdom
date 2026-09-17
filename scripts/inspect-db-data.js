const { Client } = require('ssh2');

const conn = new Client();
console.log('Connecting to remote server kritsakorn.thddns.net:5995...');

conn.on('ready', () => {
  console.log('SSH Connection Established!');

  const nodeScript = `
    const mysql = require('mysql2/promise');
    (async () => {
      try {
        const pool = mysql.createPool('mysql://smartdom:smartdom@localhost:3306/smartdomdb');
        
        console.log('=== NOTIFICATIONS ===');
        const [notifs] = await pool.query('SELECT id, user_id, title, message, type, is_read, link, created_at FROM notifications ORDER BY id DESC LIMIT 15');
        for (const n of notifs) {
          console.log('[' + n.id + '] User:' + n.user_id + ' Type:' + n.type + ' IsRead:' + n.is_read + ' Title:' + n.title + ' Link:' + n.link);
          console.log('   Message: ' + n.message);
        }

        console.log('=== DORMS ===');
        const [dorms] = await pool.query('SELECT id, dorm_name, owner_id, owner_email FROM dormitory_registry');
        for (const d of dorms) {
          console.log('Dorm #' + d.id + ': "' + d.dorm_name + '" OwnerID:' + d.owner_id + ' (' + d.owner_email + ')');
        }

        console.log('=== CONTRACTS PENDING ===');
        const [contracts] = await pool.query('SELECT id, room_id, status, tenant_name, created_at FROM contracts');
        for (const c of contracts) {
          console.log('Contract #' + c.id + ': RoomID:' + c.room_id + ' Status:' + c.status + ' Tenant:' + c.tenant_name);
        }

        console.log('=== BOOKING_PROGRESS ===');
        const [bookings] = await pool.query('SELECT id, dorm_id, room_id, status FROM booking_progress');
        for (const b of bookings) {
          console.log('Booking #' + b.id + ': DormID:' + b.dorm_id + ' RoomID:' + b.room_id + ' Status:' + b.status);
        }

        console.log('=== BILLS PENDING ===');
        const [pendingBills] = await pool.query("SELECT id, dorm_id, room_number, status, slip_url, amount FROM bills WHERE status = 'Pending'");
        for (const pb of pendingBills) {
          console.log('Bill #' + pb.id + ': DormID:' + pb.dorm_id + ' Room:' + pb.room_number + ' Status:' + pb.status + ' Slip:' + pb.slip_url);
        }

        console.log('=== CONTRACTS ===');
        const [contracts] = await pool.query('SELECT id, room_id, status, tenant_name, created_at FROM contracts ORDER BY id DESC LIMIT 10');
        console.log(JSON.stringify(contracts, null, 2));

        console.log('=== BOOKING_PROGRESS ===');
        const [bookings] = await pool.query('SELECT * FROM booking_progress ORDER BY id DESC LIMIT 10').catch(e => [[e.message]]);
        console.log(JSON.stringify(bookings, null, 2));

        console.log('=== DORMITORIES REGISTRY ===');
        const [dorms] = await pool.query('SELECT id, dorm_name, owner_id, owner_email, status FROM dormitory_registry');
        console.log(JSON.stringify(dorms, null, 2));

        console.log('=== USERS ===');
        const [users] = await pool.query('SELECT id, email, name, role, primary_role FROM users');
        console.log(JSON.stringify(users, null, 2));

        await pool.end();
      } catch (err) {
        console.error('Error:', err);
      }
      process.exit(0);
    })();
  `;

  const b64 = Buffer.from(nodeScript).toString('base64');
  const psScript = `
    cd C:\\kritsakorn\\smartdom
    $code = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("${b64}"))
    $code | node -
  `;
  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
  const cmd = `powershell.exe -NoProfile -EncodedCommand ${encoded}`;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Remote execution error:', err);
      conn.end();
      return;
    }
    stream.on('data', (d) => process.stdout.write(d.toString()));
    stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
    stream.on('close', (code) => {
      console.log('\n--- Finished with code: ' + code + ' ---');
      conn.end();
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err.message);
}).connect({
  host: 'kritsakorn.thddns.net',
  port: 5995,
  username: 'buain',
  password: 'Zn@27124700',
  readyTimeout: 10000
});
