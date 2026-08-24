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
  console.log('🚀 Capturing Upload Photo Modals for Maid and Technician...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();

  // 1. Maid
  await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await fillLoginForm(page, 'keeper@kaset2.com', 'Password123!');
  await sleep(3000);

  await page.goto(`${BASE_URL}/keeper/maid`, { waitUntil: 'networkidle2' });
  await sleep(2500);

  // Click on "งานเสร็จสิ้น" button
  const maidDoneBtn = await page.$('button.bg-emerald-600');
  if (maidDoneBtn) {
    await maidDoneBtn.click();
    await sleep(1500);
    const savePath1 = path.join(__dirname, '..', 'docs', 'testphoto', 'maid_upload_photo_modal.png');
    await page.screenshot({ path: savePath1 });
    console.log(`📸 [SAVED] -> ${savePath1}`);
  }

  // 2. Technician
  await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await fillLoginForm(page, 'tech@kaset2.com', 'Password123!');
  await sleep(3000);

  await page.goto(`${BASE_URL}/keeper/technician`, { waitUntil: 'networkidle2' });
  await sleep(2500);

  // Click on "รับงานซ่อม" first if needed or first ticket
  const techCards = await page.$$('.divide-y > div');
  if (techCards.length > 0) {
    await techCards[0].click();
    await sleep(1500);
    // Click on "ดำเนินการซ่อมเสร็จสิ้น" or "ซ่อมเสร็จแล้ว"
    const modalFinishBtn = await page.$('.space-y-6 button.bg-emerald-600');
    if (modalFinishBtn) {
      await modalFinishBtn.click();
      await sleep(1500);
    }
    const savePath2 = path.join(__dirname, '..', 'docs', 'testphoto', 'technician_upload_photo_modal.png');
    await page.screenshot({ path: savePath2 });
    console.log(`📸 [SAVED] -> ${savePath2}`);
  }

  await browser.close();
  console.log('🎉 Done capturing photo upload modals!');
})();
