const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const THDDNS_URL = 'http://kritsakorn.thddns.net:5993';

(async () => {
  console.log('🚀 Loading Keeper Dashboard directly on THDDNS...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set localStorage userEmail
  await page.goto(`${THDDNS_URL}/`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('userEmail', 'keeper@kaset2.com');
  });

  // Navigate to maid dashboard
  await page.goto(`${THDDNS_URL}/keeper/maid`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const savePath = path.join(__dirname, '..', 'docs', 'testphoto', 'keeper_maid_thddns_view.png');
  await page.screenshot({ path: savePath });
  console.log(`📸 [SAVED] -> ${savePath}`);

  await browser.close();
})();
