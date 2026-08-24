const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const OUT_DIRS = [
  path.join(__dirname, '..', 'docs', 'testphoto'),
  path.join(__dirname, '..', 'doc', 'testphoto'),
];

OUT_DIRS.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function saveScreenshot(page, filename) {
  for (const dir of OUT_DIRS) {
    const fullPath = path.join(dir, filename);
    await page.screenshot({ path: fullPath, fullPage: false });
  }
  console.log(`📸 [DIMENSION CAPTURED] -> ${filename}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForPageReady(page, extraWaitMs = 1500) {
  try {
    await page.waitForFunction(() => document.readyState === 'complete');
  } catch (e) {}
  await sleep(extraWaitMs);
}

async function fillLoginForm(page, email, password) {
  await page.waitForSelector('form input[type="text"], form input[type="email"]', { timeout: 10000 });
  const emailInput = await page.$('form input[type="text"], form input[type="email"]');
  const passInput = await page.$('form input[type="password"]');
  
  await emailInput.click({ clickCount: 3 });
  await emailInput.press('Backspace');
  await emailInput.type(email, { delay: 20 });

  await passInput.click({ clickCount: 3 });
  await passInput.press('Backspace');
  await passInput.type(password, { delay: 20 });

  const submitBtn = await page.$('form button[type="submit"]');
  if (submitBtn) await submitBtn.click();
}

(async () => {
  console.log('🚀 Starting Full-Dimension System Testing & Screenshot Recording...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();

  try {
    // ==========================================
    // 1. PUBLIC & GUEST DIMENSION
    // ==========================================
    console.log('\n🌐 --- 1. Public & Guest Dimension ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 1500);
    await saveScreenshot(page, 'dim_01_landing_page.png');

    await page.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2000);
    await saveScreenshot(page, 'dim_02_explore_search.png');

    await page.goto(`${BASE_URL}/explore/1`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2000);
    await saveScreenshot(page, 'dim_03_dorm_detail_kaset2.png');

    await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 1000);
    await saveScreenshot(page, 'dim_04_signin_portal.png');

    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 1000);
    await saveScreenshot(page, 'dim_05_signup_portal.png');

    // ==========================================
    // 2. OWNER PORTAL FULL DIMENSION
    // ==========================================
    console.log('\n👑 --- 2. Owner Portal Full Dimension ---');
    await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
    await fillLoginForm(page, 'owner@kaset2.com', 'Password123!');
    await waitForPageReady(page, 3000);

    // Overview
    await page.goto(`${BASE_URL}/owner`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_06_owner_dashboard.png');

    // Rooms Grid
    await page.goto(`${BASE_URL}/owner/rooms`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_07_owner_rooms_grid.png');

    // Add Room Modal
    const addRoomBtn = await page.$('header button:last-child');
    if (addRoomBtn) {
      await addRoomBtn.click().catch(() => {});
      await sleep(1000);
      await saveScreenshot(page, 'dim_08_owner_add_room_modal.png');
      const closeBtn = await page.$('button.modal-close, button[aria-label="Close"], form button:first-child');
      if (closeBtn) await closeBtn.click().catch(() => {});
    }

    // Batch Add Rooms Modal
    await page.goto(`${BASE_URL}/owner/rooms`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 1500);
    const batchBtn = await page.$('header button:first-of-type');
    if (batchBtn) {
      await batchBtn.click().catch(() => {});
      await sleep(1000);
      await saveScreenshot(page, 'dim_09_owner_batch_rooms_modal.png');
    }

    // Tenants Directory
    await page.goto(`${BASE_URL}/owner/tenants`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_10_owner_tenants_directory.png');

    // Meters Recording
    await page.goto(`${BASE_URL}/owner/meters`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_11_owner_meters_recording.png');

    // Billing History
    await page.goto(`${BASE_URL}/owner/billing`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_12_owner_billing_history.png');

    // Maintenance Management
    await page.goto(`${BASE_URL}/owner/maintenance`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_13_owner_maintenance_management.png');

    // Contracts Management
    await page.goto(`${BASE_URL}/owner/contracts`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_14_owner_contracts_management.png');

    // Accounting & Reports
    await page.goto(`${BASE_URL}/owner/accounting`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_15_owner_accounting_reports.png');

    // Keepers Staff
    await page.goto(`${BASE_URL}/owner/keepers`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_16_owner_keepers_staff.png');

    // Settings
    await page.goto(`${BASE_URL}/owner/settings`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_17_owner_settings_promptpay.png');

    // Subscription Status
    await page.goto(`${BASE_URL}/owner/subscription`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_18_owner_subscription_status.png');

    // ==========================================
    // 3. TENANT PORTAL FULL DIMENSION
    // ==========================================
    console.log('\n🧑‍🎓 --- 3. Tenant Portal Full Dimension ---');
    await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
    await fillLoginForm(page, 'tenant@kaset2.com', 'Password123!');
    await waitForPageReady(page, 3000);

    // Tenant Home
    await page.goto(`${BASE_URL}/tenant`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_19_tenant_dashboard.png');

    // Tenant Billing
    await page.goto(`${BASE_URL}/tenant/billing`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_20_tenant_billing_list.png');

    // Tenant PromptPay QR Modal
    const qrBtn = await page.$('button');
    if (qrBtn) {
      const btns = await page.$$('button');
      for (const b of btns) {
        const text = await page.evaluate(el => el.textContent, b);
        if (text && (text.includes('ชำระ') || text.includes('QR') || text.includes('จ่าย') || text.includes('ดูบิล'))) {
          await b.click().catch(() => {});
          await sleep(1500);
          break;
        }
      }
    }
    await saveScreenshot(page, 'dim_21_tenant_promptpay_qr_modal.png');

    // Tenant Maintenance
    await page.goto(`${BASE_URL}/tenant/maintenance`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_22_tenant_maintenance_history.png');

    // Tenant Contract
    await page.goto(`${BASE_URL}/tenant/contract`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_23_tenant_digital_contract.png');

    // Tenant Announcements
    await page.goto(`${BASE_URL}/tenant/announcements`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_24_tenant_announcements_board.png');

    // Tenant Move-Out
    await page.goto(`${BASE_URL}/tenant/move-out`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_25_tenant_moveout_request.png');

    // ==========================================
    // 4. KEEPER & MAINTENANCE DIMENSION
    // ==========================================
    console.log('\n🧹 --- 4. Keeper & Maintenance Dimension ---');
    await page.goto(`${BASE_URL}/keeper`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_26_keeper_dashboard.png');

    await page.goto(`${BASE_URL}/keeper/maid`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_27_keeper_maid_tasks.png');

    await page.goto(`${BASE_URL}/keeper/technician`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_28_keeper_technician_jobs.png');

    // ==========================================
    // 5. PLATFORM SUPERADMIN DIMENSION
    // ==========================================
    console.log('\n🛡️ --- 5. Platform Superadmin Dimension ---');
    await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
    await fillLoginForm(page, 'admin@kaset2.com', 'Password123!');
    await waitForPageReady(page, 3000);

    await page.goto(`${BASE_URL}/platform`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_29_platform_superadmin_dashboard.png');

    await page.goto(`${BASE_URL}/platform/dormitories`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_30_platform_dormitories_registry.png');

    await page.goto(`${BASE_URL}/platform/packages`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_31_platform_saas_packages.png');

    await page.goto(`${BASE_URL}/platform/accounting`, { waitUntil: 'networkidle2' });
    await waitForPageReady(page, 2500);
    await saveScreenshot(page, 'dim_32_platform_accounting_revenue.png');

    console.log('\n🎉 ALL 32 MULTI-DIMENSIONAL SCREENSHOTS SUCCESSFULLY CAPTURED!');

  } catch (err) {
    console.error('Error during multi-dimension capture:', err);
  } finally {
    await browser.close();
  }
})();
