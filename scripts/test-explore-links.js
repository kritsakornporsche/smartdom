const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--headless', '--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://kritsakorn.thddns.net:5993/explore', { waitUntil: 'networkidle2' });
  const links = await page.$$eval('a', as => as.map(a => a.href));
  console.log('Links found:', links.filter(l => l.includes('explore')));
  await browser.close();
})();
