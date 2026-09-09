const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--headless', '--no-sandbox']
  });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  page.on('pageerror', err => logs.push('PAGEERROR: ' + err.toString()));
  await page.setCookie({
    name: 'authjs.session-token',
    value: 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiTW5PeFdrbXgwTnlFT0xhMW1oT1ItdGNSV3p6Q0VCTjdmT0N0d054b1FLeVBPNXhkc3RJWC1zSHpmTnpkbm53bEtsS2lablQ4anAxQkNsTEJNa2lROVEifQ..P-mW1Alm54P7P6ZWpSi_dg.ofbEbG4Iii9oARaV3Y92qIdQdIFoq0nwo9N1MCTKvUa3mxzLdBi3zf4pUeDrFXwbU9Q1UGVi8WrUG8cr3He0eldEmWe7sUUPbY6MOL9LfbJTs5h3K6-oqHoXbYHkJlzv6YdAB8_tKKCTbJGQse4yNarIqYwAyacyzOVaQH1_nxG7Gh4k871JsrJng9gdpSEckuDJKp_QJqArQseHfHAMjgM9etBXF80RODLhLF6JdMQM1t444N5O1NeuAofFSxPu_64xRTnG4iDLJD8bLy06PYyZ2dxEZ0LQHiiUtqARjT5nHEnmqLHzV4MlDrn2QClX8dnol38dRxQnTzTvXLXzHg.wdGxCXuteO6vL-tpaWloHfEe0Q43NXCoAqd_-UX0T2g',
    domain: 'kritsakorn.thddns.net',
    path: '/'
  });
  await page.goto('http://kritsakorn.thddns.net:5993/tenant/billing', { waitUntil: 'networkidle2' });
  console.log('Page title:', await page.title());
  console.log('Logs:\n', logs.join('\n'));
  await browser.close();
})();
