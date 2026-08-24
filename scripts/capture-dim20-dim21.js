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
  console.log('🚀 Capturing dim_20 (Billing List) and dim_21 (PromptPay QR Modal)...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();

  // Login as Tenant
  await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('form input[type="text"], form input[type="email"]', { timeout: 10000 });
  const emailInput = await page.$('form input[type="text"], form input[type="email"]');
  const passInput = await page.$('form input[type="password"]');
  
  await emailInput.click({ clickCount: 3 });
  await emailInput.press('Backspace');
  await emailInput.type('tenant@kaset2.com', { delay: 20 });

  await passInput.click({ clickCount: 3 });
  await passInput.press('Backspace');
  await passInput.type('Password123!', { delay: 20 });

  const submitBtn = await page.$('form button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await sleep(3000);

  // 1. Go to Billing List
  await page.goto(`${BASE_URL}/tenant/billing`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  // Capture dim_20
  await saveScreenshot(page, 'dim_20_tenant_billing_list.png');

  // 2. Click on "ชำระเงิน" or "ดู QR Code" button
  const buttons = await page.$$('button');
  let clicked = false;
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && (text.includes('ชำระเงิน') || text.includes('QR') || text.includes('จ่าย'))) {
      await btn.click();
      clicked = true;
      console.log('Clicked QR payment button:', text);
      break;
    }
  }

  if (clicked) {
    await sleep(2500);
    // Capture dim_21 with Modal open
    await saveScreenshot(page, 'dim_21_tenant_promptpay_qr_modal.png');
  } else {
    console.error('Could not find payment button!');
  }

  console.log('🎉 Done capturing dim_20 and dim_21!');
  await browser.close();
})();
