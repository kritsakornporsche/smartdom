const puppeteer = require('puppeteer-core');

async function test() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const fs = require('fs');
  const execPath = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browser = await puppeteer.launch({
    executablePath: execPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText));
  page.on('response', res => {
    if (res.status() >= 400) {
      console.log('HTTP ERROR RESPONSE:', res.status(), res.url());
    }
  });

  console.log('Navigating to http://kritsakorn.thddns.net:5993/signin...');
  await page.goto('http://kritsakorn.thddns.net:5993/signin', { waitUntil: 'networkidle2' });

  console.log('Typing credentials...');
  await page.type('input[placeholder*="you@example.com"]', 'kritdanai');
  await page.type('input[type="password"]', 'testpassword123');

  console.log('Clicking submit...');
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 4000));

  const errorText = await page.evaluate(() => {
    return document.querySelector('.bg-destructive\\/10')?.textContent;
  });

  console.log('Error shown on page:', errorText);
  await browser.close();
}

test().catch(console.error);
