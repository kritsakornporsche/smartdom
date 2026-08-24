const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Testing Signup and Signin flow in browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // 1. Visit Signin Page
  await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  const savePath1 = path.join(__dirname, '..', 'docs', 'testphoto', 'test_signin_fixed.png');
  await page.screenshot({ path: savePath1 });
  console.log(`📸 [SAVED] -> ${savePath1}`);

  // 2. Visit Signup Page
  await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  const savePath2 = path.join(__dirname, '..', 'docs', 'testphoto', 'test_signup_fixed.png');
  await page.screenshot({ path: savePath2 });
  console.log(`📸 [SAVED] -> ${savePath2}`);

  await browser.close();
  console.log('🎉 Browser verification done!');
})();
