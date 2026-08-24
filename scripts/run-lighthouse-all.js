const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORT_DIR = path.join(__dirname, '..', 'report');
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

const targets = [
  { name: 'explore', url: 'http://localhost:3000/explore' },
  { name: 'signin', url: 'http://localhost:3000/signin' },
  { name: 'owner', url: 'http://localhost:3000/owner' },
  { name: 'tenant', url: 'http://localhost:3000/tenant' },
  { name: 'bills', url: 'http://localhost:3000/owner/billing' },
];

const modes = [
  { mode: 'desktop', flags: '--preset=desktop' },
  { mode: 'mobile', flags: '--form-factor=mobile --screenEmulation.mobile=true' }
];

console.log('🚀 เริ่มต้นการทดสอบ Google Lighthouse ทุกหน้า (Desktop & Mobile)...');
console.log(`📁 รายงานจะถูกบันทึกลงใน: ${REPORT_DIR}\n`);

(async () => {
  for (const t of targets) {
    for (const m of modes) {
      for (let run = 1; run <= 3; run++) {
        const reportName = `${t.name}_${m.mode}_run${run}`;
        const htmlOut = path.join(REPORT_DIR, `${reportName}.report.html`);
        const jsonOut = path.join(REPORT_DIR, `${reportName}.report.json`);

        console.log(`⏳ กำลังทดสอบ [${t.name.toUpperCase()} - ${m.mode.toUpperCase()} (รอบที่ ${run}/3)] -> ${t.url}`);
        
        try {
          const cmd = `npx -y lighthouse "${t.url}" --output=html,json --output-path="${path.join(REPORT_DIR, reportName)}" --chrome-flags="--headless --no-sandbox" ${m.flags} --quiet`;
          execSync(cmd, { stdio: 'inherit' });
          console.log(`   ✅ สำเร็จ: ${reportName}.report.html\n`);
        } catch (err) {
          console.error(`   ❌ เกิดข้อผิดพลาดในการทดสอบ ${reportName}:`, err.message);
        }
      }
    }
  }

  console.log('\n🎉 ทดสอบ Lighthouse ครบทุกหน้าเรียบร้อยแล้ว!');
  console.log('👉 รันคำสั่ง "npm run report:screenshots" เพื่อแคปภาพหลักฐานทั้งหมด');
})();
