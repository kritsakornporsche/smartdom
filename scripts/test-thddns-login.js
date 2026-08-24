const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const THDDNS_URL = 'http://kritsakorn.thddns.net:5993';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Testing login as keeper@kaset2.com on THDDNS domain (kritsakorn.thddns.net:5993)...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // 1. Go to signin page on THDDNS
  await page.goto(`${THDDNS_URL}/signin`, { waitUntil: 'networkidle2' });
  await sleep(2000);

  // 2. Fill in keeper credentials
  const emailInput = await page.$('input[placeholder*="you@example.com"]');
  const passInput = await page.$('input[type="password"]');

  if (emailInput && passInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.press('Backspace');
    await emailInput.type('keeper@kaset2.com', { delay: 30 });

    await passInput.click({ clickCount: 3 });
    await passInput.press('Backspace');
    await passInput.type('Password123!', { delay: 30 });

    // Click submit
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await sleep(2000);

    const currentUrl = page.url();
    console.log('🎉 Current URL after login:', currentUrl);

    const savePath = path.join(__dirname, '..', 'docs', 'testphoto', 'keeper_thddns_dashboard.png');
    await page.screenshot({ path: savePath });
    console.log(`📸 [SAVED] -> ${savePath}`);
  }

  await browser.close();
  console.log('🎉 Login verification via THDDNS completed!');
})();
