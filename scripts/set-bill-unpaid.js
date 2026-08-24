const { neon } = require('../lib/mysql-adapter');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const sql = neon(process.env.DATABASE_URL);
  
  // Update August 2026 bill for tenant@kaset2.com to 'Unpaid'
  await sql`
    UPDATE bills b
    JOIN tenants t ON b.tenant_id = t.id
    SET b.status = 'Unpaid', b.slip_url = NULL
    WHERE t.email = 'tenant@kaset2.com' AND b.billing_cycle = 'สิงหาคม 2569'
  `;
  console.log('✅ August 2026 bill set to Unpaid for tenant@kaset2.com');
})();
