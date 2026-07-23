const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const connectionUrl = process.env.DATABASE_URL.replace(/smartdom_dorm_1$/, 'smartdomdb').replace(/smartdom_platform$/, 'smartdomdb');
  console.log('Connecting to:', connectionUrl);

  const pool = mysql.createPool(connectionUrl);

  try {
    console.log('Dropping old tables if they exist...');
    
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tablesToDrop = [
      'announcement_reads', 'announcements', 'chat_messages', 'conversations',
      'cleaning_jobs', 'maintenance_jobs', 'maintenance_requests',
      'move_out_requests', 'booking_progress', 'parcels', 'bills',
      'contracts', 'tenants', 'keepers', 'rooms', 'dormitory_rules',
      'dormitory_profile', 'accounting_transactions', 'accounting_monthly_summary',
      'user_dorm_roles', 'users', 'subscriptions', 'coin_transactions',
      'platform_accounting', 'platform_activity_log', 'packages',
      'dormitory_registry', 'platform_admins',
      'meter_readings', 'notifications', 'room_inventory'
    ];

    for (const table of tablesToDrop) {
      await pool.query('DROP TABLE IF EXISTS `' + table + '`');
    }

    console.log('Creating tables...');

    const queries = [
      `CREATE TABLE platform_admins (
        id int(11) NOT NULL AUTO_INCREMENT,
        email varchar(255) NOT NULL,
        password varchar(255) NOT NULL,
        name varchar(255) NOT NULL,
        role enum('super_admin','support') DEFAULT 'super_admin',
        is_active tinyint(1) DEFAULT 1,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE users (
        id int(11) NOT NULL AUTO_INCREMENT,
        email varchar(255) NOT NULL UNIQUE,
        password varchar(255) NOT NULL,
        name varchar(255) NOT NULL,
        phone varchar(50) DEFAULT NULL,
        image_url longtext DEFAULT NULL,
        primary_role enum('owner','tenant','keeper','guest') DEFAULT 'guest',
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE dormitory_registry (
        id int(11) NOT NULL AUTO_INCREMENT,
        owner_id int(11) NOT NULL,
        dorm_name varchar(255) NOT NULL,
        phone varchar(50) DEFAULT NULL,
        address text DEFAULT NULL,
        status enum('Active','Suspended','Cancelled') DEFAULT 'Active',
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        approved_at timestamp NULL DEFAULT NULL,
        coins int(11) DEFAULT 0,
        PRIMARY KEY (id),
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE user_dorm_roles (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) NOT NULL,
        dorm_id int(11) NOT NULL,
        role enum('owner','keeper','tenant','guest') NOT NULL,
        sub_role varchar(50) DEFAULT NULL,
        is_active tinyint(1) DEFAULT 1,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY user_dorm_unique (user_id,dorm_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE packages (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        price decimal(10,2) NOT NULL,
        max_rooms int(11) NOT NULL,
        max_dorms int(11) DEFAULT 1,
        features longtext DEFAULT NULL,
        duration_days int(11) DEFAULT 30,
        is_active tinyint(1) DEFAULT 1,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE subscriptions (
        id int(11) NOT NULL AUTO_INCREMENT,
        dormitory_id int(11) NOT NULL,
        package_id int(11) NOT NULL,
        status enum('Active','Expired','Cancelled','Pending') DEFAULT 'Active',
        start_date timestamp NOT NULL DEFAULT current_timestamp(),
        end_date timestamp NULL DEFAULT NULL,
        amount_paid decimal(10,2) DEFAULT 0.00,
        payment_method varchar(50) DEFAULT 'manual',
        notes text DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dormitory_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES packages(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE coin_transactions (
        id int(11) NOT NULL AUTO_INCREMENT,
        dormitory_id int(11) NOT NULL,
        type enum('TopUp','Usage') NOT NULL,
        amount int(11) NOT NULL,
        description varchar(255) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dormitory_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE platform_accounting (
        id int(11) NOT NULL AUTO_INCREMENT,
        type enum('Income','Refund','Adjustment','Expense') NOT NULL,
        category varchar(100) DEFAULT 'Subscription',
        amount decimal(10,2) NOT NULL,
        description text DEFAULT NULL,
        dormitory_id int(11) DEFAULT NULL,
        subscription_id int(11) DEFAULT NULL,
        transaction_date date NOT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dormitory_id) REFERENCES dormitory_registry(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE platform_activity_log (
        id int(11) NOT NULL AUTO_INCREMENT,
        admin_id int(11) DEFAULT NULL,
        action varchar(100) NOT NULL,
        target_type varchar(50) DEFAULT NULL,
        target_id int(11) DEFAULT NULL,
        details longtext DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE rooms (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        room_number varchar(50) NOT NULL,
        room_type varchar(50) DEFAULT 'Standard',
        price decimal(10,2) NOT NULL,
        status enum('Available','Occupied','Maintenance') DEFAULT 'Available',
        floor int(11) DEFAULT 1,
        tenant_id int(11) DEFAULT NULL,
        image_url longtext DEFAULT NULL,
        images longtext DEFAULT NULL,
        amenities longtext DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE tenants (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        user_id int(11) DEFAULT NULL,
        room_id int(11) DEFAULT NULL,
        id_card_number varchar(20) DEFAULT NULL,
        id_card_image longtext DEFAULT NULL,
        status enum('active','past','pending') DEFAULT 'active',
        move_in_date date DEFAULT NULL,
        move_out_date date DEFAULT NULL,
        emergency_contact varchar(255) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
      
      `ALTER TABLE rooms ADD CONSTRAINT rooms_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;`,

      `CREATE TABLE keepers (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        user_id int(11) DEFAULT NULL,
        position enum('Maid','Technician','Guard','Other') DEFAULT 'Maid',
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE dormitory_profile (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL UNIQUE,
        water_rate decimal(10,2) DEFAULT 18.00,
        electricity_rate decimal(10,2) DEFAULT 8.00,
        promptpay_number varchar(50) DEFAULT NULL,
        has_wifi tinyint(1) DEFAULT 0,
        has_parking tinyint(1) DEFAULT 0,
        pet_friendly tinyint(1) DEFAULT 0,
        has_lan tinyint(1) DEFAULT 0,
        facilities text DEFAULT NULL,
        map_url longtext DEFAULT NULL,
        description text DEFAULT NULL,
        has_air_con tinyint(1) DEFAULT 0,
        cover_image longtext DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE dormitory_rules (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        title varchar(255) NOT NULL,
        content text NOT NULL,
        order_index int(11) DEFAULT 0,
        is_active tinyint(1) DEFAULT 1,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE contracts (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        tenant_id int(11) DEFAULT NULL,
        room_id int(11) DEFAULT NULL,
        start_date timestamp NULL DEFAULT NULL,
        end_date timestamp NULL DEFAULT NULL,
        deposit_amount decimal(10,2) DEFAULT 0.00,
        status varchar(50) DEFAULT 'PendingTenantSignature',
        signature_data longtext DEFAULT NULL,
        owner_signature_data longtext DEFAULT NULL,
        signed_at timestamp NULL DEFAULT NULL,
        contract_terms text DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE bills (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        tenant_id int(11) DEFAULT NULL,
        title varchar(255) NOT NULL,
        amount decimal(10,2) NOT NULL,
        billing_cycle varchar(100) DEFAULT NULL,
        due_date date DEFAULT NULL,
        status enum('Unpaid','Paid','Overdue','Cancelled') DEFAULT 'Unpaid',
        slip_url longtext DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE accounting_transactions (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        type enum('Income','Expense') NOT NULL,
        category varchar(100) NOT NULL,
        amount decimal(10,2) NOT NULL,
        description text DEFAULT NULL,
        reference_id int(11) DEFAULT NULL,
        reference_type varchar(50) DEFAULT NULL,
        transaction_date date NOT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE accounting_monthly_summary (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        year int(11) NOT NULL,
        month int(11) NOT NULL,
        total_income decimal(10,2) DEFAULT 0.00,
        total_expense decimal(10,2) DEFAULT 0.00,
        net_profit decimal(10,2) DEFAULT 0.00,
        updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY year_month_dorm (year,month,dorm_id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE announcements (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        title varchar(255) NOT NULL,
        content text NOT NULL,
        is_important tinyint(1) DEFAULT 0,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE announcement_reads (
        id int(11) NOT NULL AUTO_INCREMENT,
        announcement_id int(11) NOT NULL,
        user_id int(11) NOT NULL,
        read_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY unique_read (announcement_id,user_id),
        FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE conversations (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        tenant_user_id int(11) DEFAULT NULL,
        owner_id int(11) DEFAULT NULL,
        last_message text DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (tenant_user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE chat_messages (
        id int(11) NOT NULL AUTO_INCREMENT,
        conversation_id int(11) NOT NULL,
        sender_id int(11) NOT NULL,
        message text NOT NULL,
        is_read tinyint(1) DEFAULT 0,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE maintenance_requests (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        tenant_id int(11) DEFAULT NULL,
        room_number varchar(50) DEFAULT NULL,
        issue_type varchar(100) DEFAULT NULL,
        description text NOT NULL,
        status enum('Pending','InProgress','Completed','Cancelled') DEFAULT 'Pending',
        image_url longtext DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE maintenance_jobs (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        room_id int(11) DEFAULT NULL,
        issue text NOT NULL,
        urgency enum('normal','rush') DEFAULT 'normal',
        status enum('pending','in_progress','waiting_parts','completed','cancelled') DEFAULT 'pending',
        assigned_to int(11) DEFAULT NULL,
        notes text DEFAULT NULL,
        photo_url longtext DEFAULT NULL,
        tenant_notes text DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        completed_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE cleaning_jobs (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        room_id int(11) DEFAULT NULL,
        task varchar(255) NOT NULL,
        status enum('pending','in_progress','completed') DEFAULT 'pending',
        assigned_to int(11) DEFAULT NULL,
        notes text DEFAULT NULL,
        photo_url longtext DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        completed_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE move_out_requests (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        tenant_id int(11) DEFAULT NULL,
        room_id int(11) DEFAULT NULL,
        move_out_date date DEFAULT NULL,
        reason text DEFAULT NULL,
        status enum('Pending','Approved','Rejected') DEFAULT 'Pending',
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE booking_progress (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        guest_id int(11) DEFAULT NULL,
        room_id int(11) DEFAULT NULL,
        status varchar(50) DEFAULT 'Pending',
        notes text DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE parcels (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        room_number varchar(50) DEFAULT NULL,
        recipient_name varchar(255) DEFAULT NULL,
        tracking_number varchar(100) DEFAULT NULL,
        carrier varchar(100) DEFAULT NULL,
        status enum('Pending','Picked Up') DEFAULT 'Pending',
        image_url longtext DEFAULT NULL,
        received_date timestamp NOT NULL DEFAULT current_timestamp(),
        picked_up_at timestamp NULL DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE meter_readings (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        room_id int(11) NOT NULL,
        type enum('Water','Electric') NOT NULL,
        previous_reading decimal(10,2) DEFAULT 0.00,
        current_reading decimal(10,2) NOT NULL,
        billing_cycle varchar(50) NOT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE notifications (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) NOT NULL,
        title varchar(255) NOT NULL,
        message text NOT NULL,
        link_url varchar(255) DEFAULT NULL,
        is_read tinyint(1) DEFAULT 0,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

      `CREATE TABLE room_inventory (
        id int(11) NOT NULL AUTO_INCREMENT,
        dorm_id int(11) NOT NULL,
        room_id int(11) NOT NULL,
        item_name varchar(255) NOT NULL,
        condition_status enum('Good','Damaged','Replaced') DEFAULT 'Good',
        notes text DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        FOREIGN KEY (dorm_id) REFERENCES dormitory_registry(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    ];

    for (const q of queries) {
      await pool.query(q);
    }

    // Enable foreign key checks
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Seeding initial data...');

    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('smartdom', 10);
    const superAdminHash = await bcrypt.hash('admin', 10);

    // Platform Admin
    await pool.query('INSERT INTO platform_admins (email, password, name, role) VALUES (?, ?, ?, ?)', 
      ['admin', superAdminHash, 'Platform Owner', 'super_admin']);

    // Owner User
    const [ownerRes] = await pool.query('INSERT INTO users (email, password, name, phone, primary_role) VALUES (?, ?, ?, ?, ?)',
      ['kritsakorn801@gmail.com', hash, 'Kritsakorn', '0636040550', 'owner']);
    const ownerId = ownerRes.insertId;

    // Tenant User
    const [tenantRes] = await pool.query('INSERT INTO users (email, password, name, phone, primary_role) VALUES (?, ?, ?, ?, ?)',
      ['tenant@gmail.com', hash, 'Tenant', '0999999999', 'tenant']);
    const tenantUserId = tenantRes.insertId;

    // Dormitory
    const [dormRes] = await pool.query('INSERT INTO dormitory_registry (owner_id, dorm_name, phone, address, status, coins) VALUES (?, ?, ?, ?, ?, ?)',
      [ownerId, 'หอพักหน้ามหาวิทยาลัยพะเยา', '0636040550', '88/12', 'Active', 3000]);
    const dormId = dormRes.insertId;

    // User Dorm Role for Owner
    await pool.query('INSERT INTO user_dorm_roles (user_id, dorm_id, role) VALUES (?, ?, ?)',
      [ownerId, dormId, 'owner']);

    // User Dorm Role for Tenant
    await pool.query('INSERT INTO user_dorm_roles (user_id, dorm_id, role) VALUES (?, ?, ?)',
      [tenantUserId, dormId, 'tenant']);

    // Package & Subscription
    const [pkgRes] = await pool.query('INSERT INTO packages (name, price, max_rooms, max_dorms, features) VALUES (?, ?, ?, ?, ?)',
      ['Starter', 0, 10, 1, '["20 ห้องพัก","1 หอพัก"]']);
    const pkgId = pkgRes.insertId;

    await pool.query('INSERT INTO subscriptions (dormitory_id, package_id, status) VALUES (?, ?, ?)',
      [dormId, pkgId, 'Active']);

    // Some Rooms
    const [room1Res] = await pool.query('INSERT INTO rooms (dorm_id, room_number, price) VALUES (?, ?, ?)', [dormId, '101', 3500]);
    const room1Id = room1Res.insertId;
    await pool.query('INSERT INTO rooms (dorm_id, room_number, price) VALUES (?, ?, ?)', [dormId, '102', 4500]);

    // Create tenant record
    await pool.query('INSERT INTO tenants (dorm_id, user_id, room_id, status) VALUES (?, ?, ?, ?)', [dormId, tenantUserId, room1Id, 'active']);

    console.log('Database initialized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error during database initialization:', err);
    process.exit(1);
  }
}

main();
