const puppeteer = require('puppeteer-core');

async function test() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const fs = require('fs');
  const execPath = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browser = await puppeteer.launch({
    executablePath: execPath,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://kritsakorn.thddns.net:5993/owner/onboarding', { waitUntil: 'networkidle2' });

  const layoutInfo = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    const content = document.querySelector('.max-w-4xl');
    const flex1 = document.querySelector('.flex-1.min-h-0');
    return {
      asideBox: aside ? aside.getBoundingClientRect() : null,
      contentBox: content ? content.getBoundingClientRect() : null,
      flex1Box: flex1 ? flex1.getBoundingClientRect() : null,
      bodyScrollHeight: document.body.scrollHeight,
      windowInnerHeight: window.innerHeight,
      windowInnerWidth: window.innerWidth,
    };
  });

  console.log('Layout info:', JSON.stringify(layoutInfo, null, 2));

  await page.screenshot({ path: 'scripts/debug_screenshot.png', fullPage: true });
  console.log('Screenshot saved to scripts/debug_screenshot.png');
  await browser.close();
}

test().catch(console.error);
