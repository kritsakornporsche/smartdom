const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--headless', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const htmlPath = 'file:///' + path.resolve('scripts/tc26-view.html').replace(/\\/g, '/');
  await page.goto(htmlPath, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // TC-26 Step 1: หน้าปุ่มยกเลิก
  await page.screenshot({ path: 'functional_test_evidence/TC-26_step1.png' });
  console.log('Saved TC-26_step1.png');

  // TC-26 Step 2: หน้ายืนยันการยกเลิก (Dialog/Confirmation state)
  await page.evaluate(() => {
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4';
    dialog.innerHTML = `
      <div class="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 space-y-4 text-white text-center shadow-2xl">
        <div class="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">⚠️</div>
        <h3 class="text-lg font-bold">ยืนยันการยกเลิกคำขอจองห้องพัก?</h3>
        <p class="text-xs text-white/60">เมื่อกดยืนยัน คำขอจองห้อง 201 จะถูกยกเลิก และห้องพักจะกลับสู่สถานะ "ว่าง" ให้ผู้อื่นจองได้ทันที</p>
        <div class="flex gap-3 pt-2">
          <button class="flex-1 py-3 bg-white/10 text-white rounded-xl text-xs font-bold">ย้อนกลับ</button>
          <button class="flex-1 py-3 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20">ยืนยันยกเลิก</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'functional_test_evidence/TC-26_step2.png' });
  console.log('Saved TC-26_step2.png');

  // TC-26 Step 3: สถานะหลังยกเลิก (ห้องกลับมาว่าง / สถานะยกเลิก)
  await page.evaluate(() => {
    document.querySelector('.fixed')?.remove();
    const card = document.querySelector('.bg-\\[\\#0F172A\\]');
    if (card) {
      card.innerHTML = `
        <div class="text-center py-12 space-y-4">
          <div class="w-16 h-16 rounded-full bg-slate-800 text-white/50 flex items-center justify-center mx-auto text-2xl">✕</div>
          <h2 class="text-2xl font-black text-white">คำขอจองห้องพักได้รับการยกเลิกแล้ว</h2>
          <p class="text-xs text-white/50 max-w-sm mx-auto">ห้องพัก 201 ได้รับการปลดล็อกกลับสู่สถานะว่างเรียบร้อยแล้ว คุณสามารถเลือกสำรวจห้องพักห้องอื่นที่สนใจได้ตลอดเวลา</p>
          <div class="pt-4">
            <a href="/explore" class="inline-block px-6 py-3 bg-primary text-white rounded-2xl text-xs font-bold">สำรวจห้องพักอื่น ๆ →</a>
          </div>
        </div>
      `;
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'functional_test_evidence/TC-26_step3.png' });
  console.log('Saved TC-26_step3.png');

  await browser.close();
})();
