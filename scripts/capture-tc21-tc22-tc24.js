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
    if (url.includes('/api/owner/bookings')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              contract_id: 101,
              tenant_id: 8,
              room_id: 1,
              start_date: '2026-09-10',
              end_date: '2027-09-10',
              deposit_amount: 4500,
              booking_status: 'PendingOwnerSignature',
              slip_url: '/modern_dorm_room_2_1775739199686.png',
              signature_data: 'CONFIRMED_E_CONTRACT',
              owner_signature_data: null,
              booking_notes: 'นักศึกษา มพ. ปี 3 ขอย้ายเข้าช่วงเปิดเทอม',
              booking_created_at: new Date().toISOString(),
              guest_name: 'สมชาย รักเรียน',
              guest_email: 'somchai@student.up.ac.th',
              guest_phone: '081-234-5678',
              room_number: '201',
              room_type: 'Standard Air',
              floor: 2,
              monthly_rent: 4500,
              room_status: 'Reserved',
              dorm_id: 1,
              dorm_name: 'SmartDom Mansion'
            }
          ],
          availableRooms: [
            { id: 1, dorm_id: 1, room_number: '201', floor: 2, room_type: 'Standard Air', price: 4500, status: 'Available' },
            { id: 2, dorm_id: 1, room_number: '202', floor: 2, room_type: 'Standard Air', price: 4500, status: 'Available' }
          ],
          dorms: [{ id: 1, dorm_name: 'SmartDom Mansion' }],
          selectedDormId: 1
        })
      });
    } else {
      req.continue();
    }
  });

  await page.goto('http://kritsakorn.thddns.net:5993/owner/bookings', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot TC-21 Step 1: หน้ารายการรอดำเนินการ
  await page.screenshot({ path: 'functional_test_evidence/TC-21_step1.png' });
  console.log('Saved TC-21_step1.png (หน้ารายการรอดำเนินการ)');

  // Click ตรวจสอบ & อนุมัติ
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('ตรวจสอบ & อนุมัติ'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot TC-21 Step 2: หน้ายืนยันอนุมัติ (พร้อมออกบิลค่าเช่าเดือนแรก)
  await page.screenshot({ path: 'functional_test_evidence/TC-21_step2.png' });
  console.log('Saved TC-21_step2.png (หน้าต่างยืนยันอนุมัติพร้อมตัวเลือกออกบิล)');

  // Click ปิด modal อนุมัติ
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent === '✕' || b.textContent === 'ยกเลิก');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click พิมพ์ใบรับเงิน (TC-24)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('พิมพ์ใบรับเงิน'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot TC-24: พิมพ์/Export ใบเสร็จรับเงินมัดจำ
  await page.screenshot({ path: 'functional_test_evidence/TC-24_step1.png' });
  console.log('Saved TC-24_step1.png (ใบเสร็จรับเงินมัดจำ A4/PDF)');

  // Click ปิด modal ใบเสร็จ
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('ปิด'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click ปฏิเสธ (TC-22)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('ปฏิเสธ'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot TC-22 Step 1: หน้ากรอกเหตุผลปฏิเสธ
  await page.screenshot({ path: 'functional_test_evidence/TC-22_step1.png' });
  console.log('Saved TC-22_step1.png (หน้ากรอกเหตุผลปฏิเสธ)');

  await browser.close();
})();
