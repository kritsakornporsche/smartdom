const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  console.log('🚀 Capturing Meters Filter Suite & Pagination...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await fillLoginForm(page, 'owner@kaset2.com', 'Password123!');
  await sleep(3000);

  await page.goto(`${BASE_URL}/owner/meters`, { waitUntil: 'networkidle2' });
  await sleep(2500);

  // 1. Capture Full Default View with 10 rows and pagination + bottom buttons
  const savePath1 = path.join(__dirname, '..', 'docs', 'testphoto', 'dim_11_owner_meters_recording.png');
  const savePath1b = path.join(__dirname, '..', 'doc', 'testphoto', 'dim_11_owner_meters_recording.png');
  const savePath1c = path.join(__dirname, '..', 'docs', 'evidence_photos_full', '04_desktop_dimensions', 'dim_11_owner_meters_recording.png');
  await page.screenshot({ path: savePath1 });
  await page.screenshot({ path: savePath1b });
  await page.screenshot({ path: savePath1c });
  console.log(`📸 [SAVED] -> ${savePath1}`);

  // 2. Test Search by Room "102"
  const roomInput = await page.$('input[placeholder*="พิมพ์เลขห้อง"]');
  if (roomInput) {
    await roomInput.type('102', { delay: 50 });
    await sleep(1000);
    const savePath2 = path.join(__dirname, '..', 'docs', 'testphoto', 'meters_filtered_search_room.png');
    await page.screenshot({ path: savePath2 });
    console.log(`📸 [SAVED] -> ${savePath2}`);
    // Clear
    await page.evaluate(() => {
      const btn = document.querySelector('button.text-rose-400') || document.querySelector('button[title*="ล้าง"]') || document.querySelector('button');
    });
  }

  // 3. Test Filter by Type (Water)
  await page.goto(`${BASE_URL}/owner/meters`, { waitUntil: 'networkidle2' });
  await sleep(2000);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const waterBtn = buttons.find(b => b.textContent && b.textContent.includes('น้ำประปา'));
    if (waterBtn) waterBtn.click();
  });
  await sleep(1000);

  const savePath3 = path.join(__dirname, '..', 'docs', 'testphoto', 'meters_filtered_date_water.png');
  await page.screenshot({ path: savePath3 });
  console.log(`📸 [SAVED] -> ${savePath3}`);

  await browser.close();

  // 4. Mobile View
  const mobileBrowser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844']
  });

  const mPage = await mobileBrowser.newPage();
  await mPage.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await fillLoginForm(mPage, 'owner@kaset2.com', 'Password123!');
  await sleep(3000);

  await mPage.goto(`${BASE_URL}/owner/meters`, { waitUntil: 'networkidle2' });
  await sleep(2500);

  const mPath1 = path.join(__dirname, '..', 'docs', 'testphoto', 'mobile_11_owner_meters_recording.png');
  const mPath1c = path.join(__dirname, '..', 'docs', 'evidence_photos_full', '05_mobile_dimensions', 'mobile_11_owner_meters_recording.png');
  await mPage.screenshot({ path: mPath1 });
  await mPage.screenshot({ path: mPath1c });
  console.log(`📱 [SAVED] -> ${mPath1}`);

  await mobileBrowser.close();
  console.log('🎉 Done capturing all meters filter & pagination screens!');
})();
