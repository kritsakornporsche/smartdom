const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const THDDNS_URL = 'http://kritsakorn.thddns.net:5993';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  page.on('requestfailed', request => {
    console.log(`❌ REQUEST FAILED: ${request.url()} | Error: ${request.failure()?.errorText}`);
  });

  page.on('response', async response => {
    if (response.status() >= 400) {
      const text = await response.text().catch(() => '');
      console.log(`⚠️ HTTP ${response.status()}: ${response.url()}`);
      console.log('Response Body:', text);
    }
  });

  // 1. Visit Signin
  await page.goto(`${THDDNS_URL}/signin`, { waitUntil: 'networkidle2' });

  // 2. Type credentials
  const emailInput = await page.$('input[placeholder*="you@example.com"]');
  const passInput = await page.$('input[type="password"]');

  await emailInput.type('keeper@kaset2.com');
  await passInput.type('Password123!');

  // 3. Click Submit
  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();

  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
})();
