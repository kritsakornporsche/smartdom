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
  const tenantCookie = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiTW5PeFdrbXgwTnlFT0xhMW1oT1ItdGNSV3p6Q0VCTjdmT0N0d054b1FLeVBPNXhkc3RJWC1zSHpmTnpkbm53bEtsS2lablQ4anAxQkNsTEJNa2lROVEifQ..P-mW1Alm54P7P6ZWpSi_dg.ofbEbG4Iii9oARaV3Y92qIdQdIFoq0nwo9N1MCTKvUa3mxzLdBi3zf4pUeDrFXwbU9Q1UGVi8WrUG8cr3He0eldEmWe7sUUPbY6MOL9LfbJTs5h3K6-oqHoXbYHkJlzv6YdAB8_tKKCTbJGQse4yNarIqYwAyacyzOVaQH1_nxG7Gh4k871JsrJng9gdpSEckuDJKp_QJqArQseHfHAMjgM9etBXF80RODLhLF6JdMQM1t444N5O1NeuAofFSxPu_64xRTnG4iDLJD8bLy06PYyZ2dxEZ0LQHiiUtqARjT5nHEnmqLHzV4MlDrn2QClX8dnol38dRxQnTzTvXLXzHg.wdGxCXuteO6vL-tpaWloHfEe0Q43NXCoAqd_-UX0T2g';

  // 1. Intercept /api/rooms/1 on /explore/room/1 to return standard room
  console.log('--- Step 1: TC-19 & TC-20 (Explore room booking) ---');
  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.includes('/api/rooms/1')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            room_number: '201',
            floor: 2,
            room_type: 'Air Conditioner / Standard',
            price: 4500,
            status: 'Available',
            dorm_id: 1,
            dorm_name: 'SmartDom Mansion',
            dorm_address: '888 ถนนพะเยา ต.แม่กา อ.เมือง จ.พะเยา',
            dorm_phone: '088-999-8888',
            owner_name: 'คุณกฤษณะ เกษตรสมบูรณ์',
            images: '["/modern_dorm_room_2_1775739199686.png"]'
          }
        })
      });
    } else if (url.includes('/api/booking/qr')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          qrImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><rect x="20" y="20" width="60" height="60" fill="black"/><rect x="120" y="20" width="60" height="60" fill="black"/><rect x="20" y="120" width="60" height="60" fill="black"/><rect x="40" y="40" width="20" height="20" fill="white"/><rect x="140" y="40" width="20" height="20" fill="white"/><rect x="40" y="140" width="20" height="20" fill="white"/><circle cx="100" cy="100" r="15" fill="black"/></svg>',
          amount: 4500,
          promptpayNumber: '088-999-8888',
          promptpayName: 'SmartDom Management'
        })
      });
    } else {
      req.continue();
    }
  });

  await page.goto('http://kritsakorn.thddns.net:5993/explore/room/1', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'functional_test_evidence/TC-19_step1.png' });
  console.log('Saved TC-19_step1.png (หน้าห้องที่เลือก)');

  // Step 2 form
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('ตกลงเช่า และเริ่มจอง'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.type('input[placeholder="ชื่อจริง - นามสกุลจริง"]', 'นายสมชาย รักเรียน (ผู้เช่า)');
  await page.type('input[placeholder="08X-XXX-XXXX"]', '081-234-5678');
  await page.screenshot({ path: 'functional_test_evidence/TC-19_step2.png' });
  console.log('Saved TC-19_step2.png (หน้าฟอร์มจอง)');

  // Step 3 to contract and Step 4 to QR
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('ถัดไป: ตรวจสอบและลงนามสัญญา'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('ยืนยันและไปขั้นตอนชำระเงิน') || b.textContent.includes('ลงนามสัญญาเช่า'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'functional_test_evidence/TC-19_step3.png' });
  console.log('Saved TC-19_step3.png (หน้า QR + ยอดเงินมัดจำ)');

  // Attach slip
  await page.evaluate(() => {
    const dummySlip = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    window.__setDummySlip && window.__setDummySlip(dummySlip);
  });
  await page.screenshot({ path: 'functional_test_evidence/TC-20_step1.png' });
  console.log('Saved TC-20_step1.png (หน้าอัปโหลดสลิปยืนยันมัดจำ)');

  await browser.close();
})();
