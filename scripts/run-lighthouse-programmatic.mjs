import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';
import lighthouse from 'lighthouse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://kritsakorn.thddns.net:5993';
const REPORT_DIR = path.join(__dirname, '..', 'report_final');
const SCREENSHOT_DIR = path.join(REPORT_DIR, 'screenshots');

if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Read cookies from run_lighthouse_final.sh
const shPath = path.join(__dirname, 'run_lighthouse_final.sh');
const shContent = fs.readFileSync(shPath, 'utf-8');
const ownerCookieMatch = shContent.match(/OWNER_COOKIE_VALUE="([^"]+)"/);
const tenantCookieMatch = shContent.match(/TENANT_COOKIE_VALUE="([^"]+)"/);
const cookieNameMatch = shContent.match(/COOKIE_NAME="([^"]+)"/);

const OWNER_COOKIE = ownerCookieMatch ? ownerCookieMatch[1] : '';
const TENANT_COOKIE = tenantCookieMatch ? tenantCookieMatch[1] : '';
const COOKIE_NAME = cookieNameMatch ? cookieNameMatch[1] : 'authjs.session-token';

const PAGES = [
  { name: 'explore', path: '/explore', auth: 'none' },
  { name: 'signin', path: '/signin', auth: 'none' },
  { name: 'owner', path: '/owner', auth: 'owner' },
  { name: 'tenant', path: '/tenant', auth: 'tenant' },
  { name: 'bills', path: '/tenant/billing', auth: 'tenant' }
];

const MODES = [
  { mode: 'desktop', formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0, cpuSlowdownMultiplier: 1 } },
  { mode: 'mobile', formFactor: 'mobile', screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false }, throttling: { rttMs: 150, throughputKbps: 1638.4, requestLatencyMs: 562.5, downloadThroughputKbps: 1474.56, uploadThroughputKbps: 675, cpuSlowdownMultiplier: 4 } }
];

const RUNS_PER_PAGE = 3;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function calculateMedian(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

(async () => {
  console.log('================================================================');
  console.log('🚀 เริ่มต้นการทดสอบ Lighthouse อัตโนมัติ (URL จริง + Session Auth)');
  console.log(`🌐 Target: ${BASE_URL}`);
  console.log(`📁 Out Dir: ${REPORT_DIR}`);
  console.log('================================================================\n');

  const DEBUG_PORT = 9222;
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--window-size=1440,900'
    ]
  });

  const summaryCsvPath = path.join(REPORT_DIR, 'summary.csv');
  const summaryRows = [
    'page,device,run,performance,lcp_s,cls,tbt_ms,tested_url,used_auth'
  ];
  const allResults = [];

  try {
    for (const p of PAGES) {
      for (const m of MODES) {
        for (let run = 1; run <= RUNS_PER_PAGE; run++) {
          const prefixName = `${p.name}_${m.mode}_run${run}`;
          const url = `${BASE_URL}${p.path}`;

          console.log(`⏳ [${p.name.toUpperCase()} / ${m.mode.toUpperCase()}] รอบที่ ${run}/${RUNS_PER_PAGE} (auth=${p.auth}) -> ${url}`);

          // Set extraHeaders for auth
          let extraHeaders = {};
          if (p.auth === 'owner' && OWNER_COOKIE) {
            extraHeaders = { Cookie: `${COOKIE_NAME}=${OWNER_COOKIE}` };
          } else if (p.auth === 'tenant' && TENANT_COOKIE) {
            extraHeaders = { Cookie: `${COOKIE_NAME}=${TENANT_COOKIE}` };
          }

          const lhFlags = {
            port: DEBUG_PORT,
            output: ['html', 'json'],
            logLevel: 'error',
            onlyCategories: ['performance'],
            formFactor: m.formFactor,
            screenEmulation: m.screenEmulation,
            throttling: m.throttling,
            extraHeaders
          };

          try {
            const runnerResult = await lighthouse(url, lhFlags);
            const lhr = runnerResult.lhr;

            const htmlReport = runnerResult.report[0];
            const jsonReport = runnerResult.report[1];

            const htmlPath = path.join(REPORT_DIR, `${prefixName}.report.html`);
            const jsonPath = path.join(REPORT_DIR, `${prefixName}.report.json`);
            fs.writeFileSync(htmlPath, htmlReport, 'utf-8');
            fs.writeFileSync(jsonPath, jsonReport, 'utf-8');

            const perf = Math.round((lhr.categories?.performance?.score || 0) * 100);
            const lcp = ((lhr.audits?.['largest-contentful-paint']?.numericValue || 0) / 1000).toFixed(2);
            const cls = (lhr.audits?.['cumulative-layout-shift']?.numericValue || 0).toFixed(3);
            const tbt = Math.round(lhr.audits?.['total-blocking-time']?.numericValue || 0);

            const row = `${p.name},${m.mode},${run},${perf},${lcp},${cls},${tbt},${url},${p.auth}`;
            summaryRows.push(row);
            allResults.push({
              page: p.name,
              device: m.mode,
              run,
              perf: Number(perf),
              lcp: Number(lcp),
              cls: Number(cls),
              tbt: Number(tbt),
              url,
              auth: p.auth
            });

            console.log(`   ✅ สำเร็จ [Performance: ${perf}, LCP: ${lcp}s, CLS: ${cls}, TBT: ${tbt}ms]`);
          } catch (err) {
            console.error(`   ❌ ข้อผิดพลาดในรอบ ${prefixName}:`, err.message);
          }

          await sleep(1000);
        }
      }
    }
  } finally {
    await browser.close();
  }

  // Write summary.csv
  fs.writeFileSync(summaryCsvPath, summaryRows.join('\n') + '\n', 'utf-8');
  console.log(`\n📄 บันทึก ${summaryCsvPath} เรียบร้อยแล้ว`);

  // Compute Medians
  const groups = {};
  for (const res of allResults) {
    const key = `${res.page}|${res.device}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(res);
  }

  const medianRows = [
    'page,device,performance_median,lcp_s_median,cls_median,tbt_ms_median,n_runs,used_auth'
  ];

  for (const [key, items] of Object.entries(groups)) {
    const [page, device] = key.split('|');
    const perfMed = Math.round(calculateMedian(items.map(i => i.perf)));
    const lcpMed = calculateMedian(items.map(i => i.lcp)).toFixed(2);
    const clsMed = calculateMedian(items.map(i => i.cls)).toFixed(3);
    const tbtMed = Math.round(calculateMedian(items.map(i => i.tbt)));
    medianRows.push(`${page},${device},${perfMed},${lcpMed},${clsMed},${tbtMed},${items.length},${items[0].auth}`);
  }

  const medianSummaryPath = path.join(REPORT_DIR, 'median_summary.csv');
  fs.writeFileSync(medianSummaryPath, medianRows.join('\n') + '\n', 'utf-8');
  console.log(`📊 บันทึก ${medianSummaryPath} เรียบร้อยแล้ว`);

  // Screenshots capture
  console.log('\n📸 กำลังบันทึกภาพหน้าจอหลักฐาน (HTML Reports & Live Authenticated Dashboard)...');
  try {
    const shotBrowser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const reportFiles = fs.readdirSync(REPORT_DIR).filter(f => f.endsWith('.report.html'));
    for (const f of reportFiles) {
      const base = f.replace('.report.html', '');
      const page = await shotBrowser.newPage();
      await page.setViewport({ width: 1280, height: 1400 });
      const absHtmlPath = path.join(REPORT_DIR, f);
      await page.goto(`file://${absHtmlPath}`, { waitUntil: 'load' });
      await sleep(300);
      const outPng = path.join(SCREENSHOT_DIR, `${base}.png`);
      await page.screenshot({ path: outPng, fullPage: false });
      await page.close();
    }

    // Direct Screenshot of Live owner and tenant pages to verify Dashboard
    const checkLive = async (targetPath, authCookie, name) => {
      const page = await shotBrowser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      if (authCookie) {
        await page.setCookie({
          name: COOKIE_NAME,
          value: authCookie,
          domain: 'kritsakorn.thddns.net',
          path: '/'
        });
      }
      await page.goto(`${BASE_URL}${targetPath}`, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await sleep(2500);
      const outLivePng = path.join(SCREENSHOT_DIR, `live_${name}_dashboard_verification.png`);
      await page.screenshot({ path: outLivePng });
      console.log(`   📸 ภาพยืนยัน Dashboard จริง: ${outLivePng}`);
      await page.close();
    };

    await checkLive('/owner', OWNER_COOKIE, 'owner');
    await checkLive('/tenant', TENANT_COOKIE, 'tenant');

    await shotBrowser.close();
    console.log(`✅ แคปภาพหลักฐานทั้งหมด (${reportFiles.length + 2} ไฟล์) ลงใน ${SCREENSHOT_DIR} เรียบร้อยแล้ว`);
  } catch (err) {
    console.error('⚠️ ข้อผิดพลาดในการแคปภาพ:', err.message);
  }

  console.log('\n================================================================');
  console.log('🎉 การทดสอบ Lighthouse ทั้งหมดเสร็จสิ้นสมบูรณ์ 100%!');
  console.log('================================================================');
})();
