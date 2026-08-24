const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const OUT_DIRS = [
  path.join(__dirname, '..', 'docs', 'testphoto'),
  path.join(__dirname, '..', 'doc', 'testphoto'),
  path.join(__dirname, '..', 'docs', 'evidence_photos_full', '04_desktop_dimensions'),
  path.join(__dirname, '..', 'docs', 'evidence_photos_full', '05_mobile_dimensions'),
];

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

async function saveDesktopPhoto(page, filename) {
  const targets = [
    path.join(__dirname, '..', 'docs', 'testphoto', filename),
    path.join(__dirname, '..', 'doc', 'testphoto', filename),
    path.join(__dirname, '..', 'docs', 'evidence_photos_full', '04_desktop_dimensions', filename),
  ];
  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: t, fullPage: false });
  }
  console.log(`📸 [DESKTOP SAVED] -> ${filename}`);
}

async function saveMobilePhoto(page, filename) {
  const targets = [
    path.join(__dirname, '..', 'docs', 'testphoto', filename),
    path.join(__dirname, '..', 'doc', 'testphoto', filename),
    path.join(__dirname, '..', 'docs', 'evidence_photos_full', '05_mobile_dimensions', filename),
  ];
  for (const t of targets) {
    const dir = path.dirname(t);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: t, fullPage: false });
  }
  console.log(`📱 [MOBILE SAVED] -> ${filename}`);
}

(async () => {
  console.log('🚀 Testing and Capturing Multi-Dormitory Maid and Technician screens...');

  // 1. Desktop Mode (1440x900)
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();

  // Test Maid (keeper@kaset2.com)
  await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await fillLoginForm(page, 'keeper@kaset2.com', 'Password123!');
  await sleep(3000);

  // Maid Dashboard
  await page.goto(`${BASE_URL}/keeper/maid`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  await saveDesktopPhoto(page, 'dim_26_keeper_dashboard.png');
  await saveDesktopPhoto(page, 'dim_27_keeper_maid_tasks.png');

  // Test Technician (tech@kaset2.com)
  await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await fillLoginForm(page, 'tech@kaset2.com', 'Password123!');
  await sleep(3000);

  // Technician Dashboard
  await page.goto(`${BASE_URL}/keeper/technician`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  await saveDesktopPhoto(page, 'dim_28_keeper_technician_jobs.png');

  await browser.close();

  // 2. Mobile Mode (390x844)
  const mobileBrowser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844']
  });

  const mPage = await mobileBrowser.newPage();

  // Mobile Maid
  await mPage.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await fillLoginForm(mPage, 'keeper@kaset2.com', 'Password123!');
  await sleep(3000);

  await mPage.goto(`${BASE_URL}/keeper/maid`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  await saveMobilePhoto(mPage, 'mobile_26_keeper_dashboard.png');
  await saveMobilePhoto(mPage, 'mobile_27_keeper_maid_tasks.png');

  // Mobile Technician
  await mPage.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await fillLoginForm(mPage, 'tech@kaset2.com', 'Password123!');
  await sleep(3000);

  await mPage.goto(`${BASE_URL}/keeper/technician`, { waitUntil: 'networkidle2' });
  await sleep(2500);
  await saveMobilePhoto(mPage, 'mobile_28_keeper_technician_jobs.png');

  await mobileBrowser.close();
  console.log('🎉 ALL MULTI-DORM KEEPER AND TECHNICIAN SCREENSHOTS CAPTURED!');
})();
