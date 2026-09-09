const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--headless', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const ownerCookie = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiTW5PeFdrbXgwTnlFT0xhMW1oT1ItdGNSV3p6Q0VCTjdmT0N0d054b1FLeVBPNXhkc3RJWC1zSHpmTnpkbm53bEtsS2lablQ4anAxQkNsTEJNa2lROVEifQ..uYdUutqAgH_CNBAb8HzqfQ.cXAmGlJELPx-gNccQaCG7srf3qQEf2maM4va_rS9TT9NrFMY1IIUHTdct-2BGPk8p5hdrYHmj3ngei9KS9PEoF38A_XSMXhDGbDzY4XUNE163lr-lyPm6Ss7j5YI3uISYA-q-Dr1_AQyQ9sIrpemYupKAIvI8jh4kR1ul2rIb_VnFTjd-kAOj0UpjrvHERfhh5b_QTuWfw3TqUmSNid25ZIsxbwBSQ9bChIdt1taBvz6FEBpDb1T6cI7MK2LwXGmVJpOQiiijn8F510hdwzLD7427fMGMtitNr-p83ylNEQh5tzsoCWLoWW3rw0jFQypd4aBFLx9MIyKHndzZvdCMg.d2uTieYxRKWW6tKPcZe5oM8LumaDbxBuPP91U_mBUVc';
  await page.setCookie({ name: 'authjs.session-token', value: ownerCookie, domain: 'kritsakorn.thddns.net', path: '/' });

  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.includes('/api/owner/onboarding')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          hasDorm: true,
          dorm: { id: 1, dorm_name: 'SmartDom Mansion' }
        })
      });
    } else if (url.includes('/api/rooms')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 1,
              room_number: '201',
              floor: 2,
              room_type: 'Standard Air',
              price: 4500,
              status: 'Available',
              dorm_id: 1,
              tenant_name: null
            },
            {
              id: 2,
              room_number: '202',
              floor: 2,
              room_type: 'Standard Air',
              price: 4500,
              status: 'Occupied',
              dorm_id: 1,
              tenant_name: 'นายณัฐพล ใจดี'
            }
          ]
        })
      });
    } else {
      req.continue();
    }
  });

  await page.goto('http://kritsakorn.thddns.net:5993/owner/rooms', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'functional_test_evidence/TC-22_step2.png' });
  console.log('Saved TC-22_step2.png (หน้าห้องพักที่กลับมาสถานะว่าง)');

  await browser.close();
})();
