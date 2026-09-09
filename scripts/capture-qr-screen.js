const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--headless', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

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

  // Step 1 to Step 2
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('ตกลงเช่า และเริ่มจอง'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.type('input[placeholder="ชื่อจริง - นามสกุลจริง"]', 'นายสมชาย รักเรียน (ผู้เช่า)');
  await page.type('input[placeholder="08X-XXX-XXXX"]', '081-234-5678');

  // Step 2 to Step 3 (Contract Modal)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('ถัดไป: ตรวจสอบและลงนามสัญญา'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check agreement checkbox in modal
  await page.evaluate(() => {
    const checkbox = document.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.click();
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // Click Agree & Proceed to Step 4 (QR Payment)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('ยอมรับสัญญาเช่าและไปขั้นตอนชำระเงิน'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot TC-19 Step 3 (QR + ยอดเงินมัดจำ)
  await page.screenshot({ path: 'functional_test_evidence/TC-19_step3.png' });
  console.log('Saved TC-19_step3.png (หน้า QR + ยอดเงินมัดจำ)');

  await browser.close();
})();
