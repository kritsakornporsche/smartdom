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

(async () => {
  console.log('📸 Capturing dim_11_owner_meters_recording.png with loaded meter data...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  
  // Login as Owner
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
  await sleep(2500);

  // Navigate to meters page
  await page.goto(`${BASE_URL}/owner/meters`, { waitUntil: 'networkidle2' });
  await sleep(2500);

  for (const dir of OUT_DIRS) {
    const fullPath = path.join(dir, 'dim_11_owner_meters_recording.png');
    await page.screenshot({ path: fullPath, fullPage: false });
  }

  console.log('✅ dim_11_owner_meters_recording.png captured successfully!');
  await browser.close();
})();
