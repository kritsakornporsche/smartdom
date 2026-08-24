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
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await fillLoginForm(page, 'tech@kaset2.com', 'Password123!');
  await sleep(3000);

  await page.goto(`${BASE_URL}/keeper/technician`, { waitUntil: 'networkidle2' });
  await sleep(2500);

  // Click on "ซ่อมเสร็จแล้ว" or click card then "ดำเนินการซ่อมเสร็จสิ้น"
  await page.evaluate(() => {
    // Find an in-progress card and click its green button or card
    const cards = Array.from(document.querySelectorAll('.divide-y > div'));
    for (const card of cards) {
      const greenBtn = card.querySelector('button.bg-emerald-600');
      if (greenBtn) {
        greenBtn.click();
        return;
      }
    }
    // If not found, click first card
    if (cards[0]) cards[0].click();
  });
  await sleep(1500);

  // If inside modal and button says "ดำเนินการซ่อมเสร็จสิ้น", click it
  await page.evaluate(() => {
    const modalFinishBtn = document.querySelector('.pt-4 button.bg-emerald-600');
    if (modalFinishBtn) modalFinishBtn.click();
  });
  await sleep(1500);

  const savePath = path.join(__dirname, '..', 'docs', 'testphoto', 'technician_upload_photo_modal.png');
  await page.screenshot({ path: savePath });
  console.log(`📸 [SAVED] -> ${savePath}`);

  await browser.close();
})();
