const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--headless', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const tenantCookie = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiTW5PeFdrbXgwTnlFT0xhMW1oT1ItdGNSV3p6Q0VCTjdmT0N0d054b1FLeVBPNXhkc3RJWC1zSHpmTnpkbm53bEtsS2lablQ4anAxQkNsTEJNa2lROVEifQ..P-mW1Alm54P7P6ZWpSi_dg.ofbEbG4Iii9oARaV3Y92qIdQdIFoq0nwo9N1MCTKvUa3mxzLdBi3zf4pUeDrFXwbU9Q1UGVi8WrUG8cr3He0eldEmWe7sUUPbY6MOL9LfbJTs5h3K6-oqHoXbYHkJlzv6YdAB8_tKKCTbJGQse4yNarIqYwAyacyzOVaQH1_nxG7Gh4k871JsrJng9gdpSEckuDJKp_QJqArQseHfHAMjgM9etBXF80RODLhLF6JdMQM1t444N5O1NeuAofFSxPu_64xRTnG4iDLJD8bLy06PYyZ2dxEZ0LQHiiUtqARjT5nHEnmqLHzV4MlDrn2QClX8dnol38dRxQnTzTvXLXzHg.wdGxCXuteO6vL-tpaWloHfEe0Q43NXCoAqd_-UX0T2g';
  await page.setCookie({ name: 'authjs.session-token', value: tenantCookie, domain: 'kritsakorn.thddns.net', path: '/' });

  await page.goto('http://kritsakorn.thddns.net:5993/tenant', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // TC-26 Step 1: หน้าปุ่มยกเลิกการจอง
  await page.screenshot({ path: 'functional_test_evidence/TC-26_step1.png' });
  console.log('Saved TC-26_step1.png (หน้าปุ่มยกเลิกการจองฝั่งผู้เช่า)');

  // TC-21 Step 3: บิลค่าเช่าในระบบ (หน้า /owner/billing)
  const ownerCookie = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiTW5PeFdrbXgwTnlFT0xhMW1oT1ItdGNSV3p6Q0VCTjdmT0N0d054b1FLeVBPNXhkc3RJWC1zSHpmTnpkbm53bEtsS2lablQ4anAxQkNsTEJNa2lROVEifQ..uYdUutqAgH_CNBAb8HzqfQ.cXAmGlJELPx-gNccQaCG7srf3qQEf2maM4va_rS9TT9NrFMY1IIUHTdct-2BGPk8p5hdrYHmj3ngei9KS9PEoF38A_XSMXhDGbDzY4XUNE163lr-lyPm6Ss7j5YI3uISYA-q-Dr1_AQyQ9sIrpemYupKAIvI8jh4kR1ul2rIb_VnFTjd-kAOj0UpjrvHERfhh5b_QTuWfw3TqUmSNid25ZIsxbwBSQ9bChIdt1taBvz6FEBpDb1T6cI7MK2LwXGmVJpOQiiijn8F510hdwzLD7427fMGMtitNr-p83ylNEQh5tzsoCWLoWW3rw0jFQypd4aBFLx9MIyKHndzZvdCMg.d2uTieYxRKWW6tKPcZe5oM8LumaDbxBuPP91U_mBUVc';
  await page.setCookie({ name: 'authjs.session-token', value: ownerCookie, domain: 'kritsakorn.thddns.net', path: '/' });
  await page.goto('http://kritsakorn.thddns.net:5993/owner/billing', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'functional_test_evidence/TC-21_step3.png' });
  console.log('Saved TC-21_step3.png (หน้ารายการบิลที่สร้างในระบบ)');

  await browser.close();
})();
