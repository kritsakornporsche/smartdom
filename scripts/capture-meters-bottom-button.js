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
  console.log('🚀 Capturing Meters Page with New Bottom Buttons...');
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

  // Scroll scrollable container to bottom
  await page.evaluate(() => {
    const scrollContainer = document.querySelector('div.flex-1.overflow-y-auto');
    if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
  });
  await sleep(1500);

  const savePath1 = path.join(__dirname, '..', 'docs', 'testphoto', 'dim_11_owner_meters_recording.png');
  const savePath1b = path.join(__dirname, '..', 'doc', 'testphoto', 'dim_11_owner_meters_recording.png');
  const savePath1c = path.join(__dirname, '..', 'docs', 'evidence_photos_full', '04_desktop_dimensions', 'dim_11_owner_meters_recording.png');
  const savePathBottom = path.join(__dirname, '..', 'docs', 'testphoto', 'meters_bottom_action_buttons.png');

  await page.screenshot({ path: savePath1 });
  await page.screenshot({ path: savePath1b });
  await page.screenshot({ path: savePath1c });
  await page.screenshot({ path: savePathBottom });
  console.log(`📸 [SAVED] -> ${savePath1}`);

  // 2. Open Batch Modal and capture
  const batchBtn = await page.$('button.from-emerald-600');
  if (batchBtn) {
    await batchBtn.click();
    await sleep(1500);
    const savePath2 = path.join(__dirname, '..', 'docs', 'testphoto', 'meters_batch_modal.png');
    await page.screenshot({ path: savePath2 });
    console.log(`📸 [SAVED] -> ${savePath2}`);
  }

  await browser.close();

  // 3. Mobile Mode
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

  await mPage.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await sleep(1000);

  const mPath1 = path.join(__dirname, '..', 'docs', 'testphoto', 'mobile_11_owner_meters_recording.png');
  const mPath1c = path.join(__dirname, '..', 'docs', 'evidence_photos_full', '05_mobile_dimensions', 'mobile_11_owner_meters_recording.png');
  await mPage.screenshot({ path: mPath1 });
  await mPage.screenshot({ path: mPath1c });
  console.log(`📱 [SAVED] -> ${mPath1}`);

  await mobileBrowser.close();
  console.log('🎉 Done capturing updated meters pages!');
})();
