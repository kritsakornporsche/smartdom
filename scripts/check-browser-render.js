const puppeteer = require('puppeteer-core');

async function test() {
  // Find chrome
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
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  console.log('Navigating to http://kritsakorn.thddns.net:5993/owner/onboarding...');
  await page.goto('http://kritsakorn.thddns.net:5993/owner/onboarding', { waitUntil: 'networkidle2', timeout: 30000 });

  const url = page.url();
  console.log('Final URL after navigation:', url);

  const bodySnippet = await page.evaluate(() => {
    const main = document.querySelector('div.flex-1');
    return {
      mainExists: !!main,
      mainInnerHTML: main ? main.innerHTML.slice(0, 500) : 'NO MAIN',
      text: document.body.innerText.slice(0, 500)
    };
  });

  console.log('Main snippet:', bodySnippet);
  await browser.close();
}

test().catch(console.error);
