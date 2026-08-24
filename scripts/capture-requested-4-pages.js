const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const OUT_DIRS = [
  path.join(__dirname, '..', 'docs', 'testphoto'),
  path.join(__dirname, '..', 'doc', 'testphoto'),
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function saveScreenshot(page, filename) {
  for (const dir of OUT_DIRS) {
    const fullPath = path.join(dir, filename);
    await page.screenshot({ path: fullPath, fullPage: false });
  }
  console.log(`📸 [SAVED] -> ${filename}`);
}

(async () => {
  console.log('🚀 Capturing the 4 simulated pages...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();

  // 1. Login as Owner
  await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('form input[type="text"], form input[type="email"]', { timeout: 10000 });
  const emailInput = await page.$('form input[type="text"], form input[type="email"]');
  const passInput = await page.$('form input[type="password"]');
  
  await emailInput.click({ clickCount: 3 });
  await emailInput.press('Backspace');
  await emailInput.type('owner@kaset2.com', { delay: 20 });

  await passInput.click({ clickCount: 3 });
  await passInput.press('Backspace');
  await passInput.type('Password123!', { delay: 20 });

  const submitBtn = await page.$('form button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await sleep(3000);

  // 1) Maintenance Management
  await page.goto(`${BASE_URL}/owner/maintenance`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  await saveScreenshot(page, 'dim_13_owner_maintenance_management.png');

  // 2) Accounting Reports
  await page.goto(`${BASE_URL}/owner/accounting`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  await saveScreenshot(page, 'dim_15_owner_accounting_reports.png');

  // 3) Keepers & Staff
  await page.goto(`${BASE_URL}/owner/keepers`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  await saveScreenshot(page, 'dim_16_owner_keepers_staff.png');

  // 4) Tenant Announcements Board
  await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await sleep(1000);
  const emailInputT = await page.$('form input[type="text"], form input[type="email"]');
  const passInputT = await page.$('form input[type="password"]');
  
  await emailInputT.click({ clickCount: 3 });
  await emailInputT.press('Backspace');
  await emailInputT.type('tenant@kaset2.com', { delay: 20 });

  await passInputT.click({ clickCount: 3 });
  await passInputT.press('Backspace');
  await passInputT.type('Password123!', { delay: 20 });

  const submitBtnT = await page.$('form button[type="submit"]');
  if (submitBtnT) await submitBtnT.click();
  await sleep(3000);

  await page.goto(`${BASE_URL}/tenant/announcements`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  await saveScreenshot(page, 'dim_24_tenant_announcements_board.png');

  console.log('🎉 ALL 4 PAGES CAPTURED SUCCESSFULLY!');
  await browser.close();
})();
