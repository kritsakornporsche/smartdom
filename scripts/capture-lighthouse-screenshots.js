const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORT_DIR = path.join(__dirname, '..', 'report');
const OUT_DIR = path.join(REPORT_DIR, 'screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Locate Chrome
function getChromePath() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
  ];

  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return 'chrome';
}

const chromeBin = getChromePath();
console.log(`>>> 🌐 ใช้ Chrome ที่: ${chromeBin}`);

if (!fs.existsSync(REPORT_DIR)) {
  console.log(`⚠️ โฟลเดอร์ ${REPORT_DIR} ยังไม่มีไฟล์รายงาน Lighthouse`);
  process.exit(0);
}

const files = fs.readdirSync(REPORT_DIR).filter(f => f.endsWith('.report.html'));
if (files.length === 0) {
  console.log(`⚠️ ไม่พบไฟล์ .report.html ใน ${REPORT_DIR}`);
  process.exit(0);
}

let count = 0;
for (const file of files) {
  const base = path.basename(file, '.report.html');
  const htmlPath = path.join(REPORT_DIR, file);
  const outPng = path.join(OUT_DIR, `${base}.png`);

  console.log(`>>> 📸 กำลังแคปภาพ: ${base}`);
  try {
    execSync(`"${chromeBin}" --headless --disable-gpu --no-sandbox --hide-scrollbars --window-size=1280,1400 --screenshot="${outPng}" "file://${htmlPath}"`, { stdio: 'ignore' });
    if (fs.existsSync(outPng)) {
      count++;
    }
  } catch (err) {
    console.error(`   !! แคปภาพไฟล์นี้ไม่สำเร็จ: ${base}`);
  }
}

console.log(`\n🎉 === แคปภาพเสร็จสิ้นสำเร็จ ${count} ไฟล์ ในโฟลเดอร์ ${OUT_DIR} ===`);
