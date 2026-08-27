#!/usr/bin/env node
/**
 * ============================================================================
 * run_lighthouse_flow.js
 * เส้นทางที่แนะนำที่สุด (ฉบับแก้ปัญหาหน้า Bills redirect ไป signin)
 * ============================================================================
 *
 * ต่างจาก run_lighthouse_final.sh (เวอร์ชันก่อนหน้า) ตรงไหน:
 *   เวอร์ชันก่อนใช้ Lighthouse CLI + --extra-headers ใส่ Cookie เป็น HTTP header
 *   ซึ่งพบว่าหน้า /tenant/billing ยังถูก redirect ไปหน้า signin แม้ Cookie
 *   เดียวกันจะใช้ได้กับหน้า /tenant ปกติ (เพราะหน้า Billing เช็ก auth ด้วย
 *   useSession() ฝั่ง Client ซึ่งอาจไม่เห็น Cookie ที่ฉีดผ่าน header อย่างเดียว)
 *
 *   สคริปต์นี้เปลี่ยนมาใช้ Puppeteer เปิด Chrome จริง แล้วสั่ง page.setCookie()
 *   ซึ่งใส่ Cookie ลง "คุกกี้จริง" ของเบราว์เซอร์ (ไม่ใช่แค่แนบ header) ทำให้ทุก
 *   fetch/XHR ที่ JavaScript ในหน้าเว็บยิงเอง (รวมถึง useSession()) เห็น Cookie
 *   เหมือนกับตอนเปิดเบราว์เซอร์เข้าเว็บปกติทุกประการ — ทดสอบยืนยันแล้วว่าวิธีนี้
 *   ใช้งานได้จริง นอกจากนี้ยังตั้ง Cookie ใหม่ก่อนเข้าทุกหน้าที่ต้องล็อกอิน
 *   (ไม่ใช้ Cookie ตัวเดิมค้างจากหน้าก่อน) เพื่อลดความเสี่ยงเรื่องเวลา/ความหมดอายุ
 *
 * ข้อกำหนดก่อนรัน:
 *   - ต้องมี Node.js ในเครื่อง
 *   - ต้องรัน `npm install puppeteer-core lighthouse` ในโฟลเดอร์เดียวกับไฟล์นี้ก่อน
 *     (ครั้งเดียว ไม่ต้องรันซ้ำทุกครั้งที่ทดสอบ)
 *   - ต้องมี Google Chrome ติดตั้งอยู่ในเครื่อง (ตัวเดียวกับที่ใช้ปกติ)
 *   - ระบบต้อง build production (`npm run build` + `npm start`) แล้ว
 *
 * วิธีหา Cookie (เหมือนสคริปต์ก่อนหน้า):
 *   1) ล็อกอินเว็บจริงด้วยเบราว์เซอร์ปกติ ด้วยบัญชี Owner
 *   2) F12 -> Application -> Cookies -> คัดลอกค่า "next-auth.session-token"
 *   3) วางแทนที่ OWNER_COOKIE_VALUE ด้านล่าง
 *   4) ล็อกเอาต์ ล็อกอินใหม่ด้วยบัญชี Tenant ทำซ้ำแล้ววางที่ TENANT_COOKIE_VALUE
 *
 * วิธีรัน:
 *   CHROME_PATH="path/ไปยัง/chrome" node run_lighthouse_flow.js
 *   (ถ้าไม่ระบุ CHROME_PATH สคริปต์จะพยายามหา Chrome ที่ติดตั้งในเครื่องให้เอง)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ---------- ตั้งค่าตรงนี้ก่อนรัน ----------
const BASE_URL = 'http://kritsakorn.thddns.net:5993';
const COOKIE_NAME = 'authjs.session-token';
const OWNER_COOKIE_VALUE = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiTW5PeFdrbXgwTnlFT0xhMW1oT1ItdGNSV3p6Q0VCTjdmT0N0d054b1FLeVBPNXhkc3RJWC1zSHpmTnpkbm53bEtsS2lablQ4anAxQkNsTEJNa2lROVEifQ..uYdUutqAgH_CNBAb8HzqfQ.cXAmGlJELPx-gNccQaCG7srf3qQEf2maM4va_rS9TT9NrFMY1IIUHTdct-2BGPk8p5hdrYHmj3ngei9KS9PEoF38A_XSMXhDGbDzY4XUNE163lr-lyPm6Ss7j5YI3uISYA-q-Dr1_AQyQ9sIrpemYupKAIvI8jh4kR1ul2rIb_VnFTjd-kAOj0UpjrvHERfhh5b_QTuWfw3TqUmSNid25ZIsxbwBSQ9bChIdt1taBvz6FEBpDb1T6cI7MK2LwXGmVJpOQiiijn8F510hdwzLD7427fMGMtitNr-p83ylNEQh5tzsoCWLoWW3rw0jFQypd4aBFLx9MIyKHndzZvdCMg.d2uTieYxRKWW6tKPcZe5oM8LumaDbxBuPP91U_mBUVc';
const TENANT_COOKIE_VALUE = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiTW5PeFdrbXgwTnlFT0xhMW1oT1ItdGNSV3p6Q0VCTjdmT0N0d054b1FLeVBPNXhkc3RJWC1zSHpmTnpkbm53bEtsS2lablQ4anAxQkNsTEJNa2lROVEifQ..P-mW1Alm54P7P6ZWpSi_dg.ofbEbG4Iii9oARaV3Y92qIdQdIFoq0nwo9N1MCTKvUa3mxzLdBi3zf4pUeDrFXwbU9Q1UGVi8WrUG8cr3He0eldEmWe7sUUPbY6MOL9LfbJTs5h3K6-oqHoXbYHkJlzv6YdAB8_tKKCTbJGQse4yNarIqYwAyacyzOVaQH1_nxG7Gh4k871JsrJng9gdpSEckuDJKp_QJqArQseHfHAMjgM9etBXF80RODLhLF6JdMQM1t444N5O1NeuAofFSxPu_64xRTnG4iDLJD8bLy06PYyZ2dxEZ0LQHiiUtqARjT5nHEnmqLHzV4MlDrn2QClX8dnol38dRxQnTzTvXLXzHg.wdGxCXuteO6vL-tpaWloHfEe0Q43NXCoAqd_-UX0T2g';
const RUNS_PER_PAGE = 3;
const OUT_DIR = './report_flow';
// -------------------------------------------

const PAGES = [
  { name: 'explore', path: '/explore', auth: 'none' },
  { name: 'signin', path: '/signin', auth: 'none' },
  { name: 'owner', path: '/owner', auth: 'owner' },
  { name: 'tenant', path: '/tenant', auth: 'tenant' },
  { name: 'bills', path: '/tenant/billing', auth: 'tenant' },
];

const DESKTOP_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
    screenEmulation: {
      mobile: false,
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      disabled: false,
    },
    emulatedUserAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
};

function guardChecks() {
  if (BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1')) {
    console.error('!! ห้ามใช้ localhost — ต้องเป็น URL จริงที่หอพักใช้งานเท่านั้น');
    process.exit(1);
  }
  if (OWNER_COOKIE_VALUE.startsWith('แปะค่า') || TENANT_COOKIE_VALUE.startsWith('แปะค่า')) {
    console.error('!! ยังไม่ได้ใส่ค่า Cookie จริง — แก้ OWNER_COOKIE_VALUE และ TENANT_COOKIE_VALUE ก่อน');
    process.exit(1);
  }
}

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  // ลองหาที่ puppeteer เคยดาวน์โหลดไว้เอง
  const cacheDir = path.join(os.homedir(), '.cache', 'puppeteer');
  if (fs.existsSync(cacheDir)) {
    const found = findFileRecursive(cacheDir, /^chrome(\.exe)?$/);
    if (found) return found;
  }
  return null;
}

function findFileRecursive(dir, pattern, depth = 4) {
  if (depth < 0) return null;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isFile() && pattern.test(e.name)) return full;
    if (e.isDirectory()) {
      const r = findFileRecursive(full, pattern, depth - 1);
      if (r) return r;
    }
  }
  return null;
}

async function run() {
  guardChecks();

  const chromePath = findChrome();
  if (!chromePath) {
    console.error('!! หา Chrome ในเครื่องไม่เจอ ระบุเองผ่าน CHROME_PATH=... node run_lighthouse_flow.js');
    process.exit(1);
  }
  console.log('>>> ใช้ Chrome ที่:', chromePath);
  console.log('>>> จะทดสอบผ่าน URL จริง:', BASE_URL);

  const puppeteer = require('puppeteer-core');
  const { startFlow } = require('lighthouse');

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const shotDir = path.join(OUT_DIR, 'screenshots');
  fs.mkdirSync(shotDir, { recursive: true });

  const summaryRows = [['page', 'device', 'run', 'performance', 'lcp_s', 'cls', 'tbt_ms', 'used_auth']];

  const hostname = new URL(BASE_URL).hostname;

  for (const pageDef of PAGES) {
    for (const device of ['desktop', 'mobile']) {
      for (let run = 1; run <= RUNS_PER_PAGE; run++) {
        let attempt = 0;
        let success = false;
        while (!success && attempt < 3) {
          attempt++;
          console.log(`>>> [${pageDef.name}/${device}] รอบที่ ${run}${attempt > 1 ? ` (ลองใหม่ครั้งที่ ${attempt})` : ''} (auth=${pageDef.auth})`);

          const browser = await puppeteer.launch({
            executablePath: chromePath,
            headless: true,
            args: ['--headless', '--no-sandbox', '--disable-gpu'],
          });

          try {
            const page = await browser.newPage();

            // ---------- ตั้ง Cookie สดใหม่ก่อนเข้าเว็บทุกครั้ง (ถ้าหน้านี้ต้องล็อกอิน) ----------
            if (pageDef.auth !== 'none') {
              const cookieValue = pageDef.auth === 'owner' ? OWNER_COOKIE_VALUE : TENANT_COOKIE_VALUE;
              await page.setCookie(
                {
                  name: 'authjs.session-token',
                  value: cookieValue,
                  domain: hostname,
                  path: '/',
                },
                {
                  name: 'next-auth.session-token',
                  value: cookieValue,
                  domain: hostname,
                  path: '/',
                }
              );
            }

            if (device === 'mobile') {
              await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
            } else {
              await page.setViewport({ width: 1440, height: 900 });
            }

            const flow = await startFlow(page, {
              name: `${pageDef.name}-${device}-run${run}`,
              config: device === 'desktop' ? DESKTOP_CONFIG : undefined,
            });

            await flow.navigate(`${BASE_URL}${pageDef.path}`);

            // รอให้ข้อมูลฝั่ง Client โหลดเสร็จก่อนแคปภาพ/ปิด flow
            await new Promise((r) => setTimeout(r, 2000));

            const shotPath = path.join(shotDir, `${pageDef.name}_${device}_run${run}.png`);
            await page.screenshot({ path: shotPath, fullPage: false });

            const reportJson = await flow.createFlowResult();
            const step = reportJson.steps[0];
            const lhr = step.lhr;

            if (lhr.runtimeError || !lhr.categories.performance?.score) {
              throw new Error(lhr.runtimeError?.message || 'Performance score is 0 or error');
            }

            const prefix = path.join(OUT_DIR, `${pageDef.name}_${device}_run${run}`);
            fs.writeFileSync(`${prefix}.flow.json`, JSON.stringify(reportJson, null, 2));

            const perf = Math.round((lhr.categories.performance?.score || 0) * 100);
            const lcp = ((lhr.audits['largest-contentful-paint']?.numericValue || 0) / 1000).toFixed(2);
            const cls = (lhr.audits['cumulative-layout-shift']?.numericValue || 0).toFixed(3);
            const tbt = Math.round(lhr.audits['total-blocking-time']?.numericValue || 0);

            summaryRows.push([pageDef.name, device, run, perf, lcp, cls, tbt, pageDef.auth]);
            console.log(`    -> performance=${perf} lcp=${lcp}s cls=${cls} tbt=${tbt}ms`);
            success = true;
          } catch (err) {
            console.log(`    !! รอบนี้ล้มเหลว (${err.message}) -> ${attempt < 3 ? 'กำลังลองใหม่...' : 'หมดจำนวนครั้ง'}`);
            if (attempt >= 3) {
              summaryRows.push([pageDef.name, device, run, 0, '0.00', '0.000', 0, pageDef.auth]);
            }
          } finally {
            await browser.close();
          }
        }
      }
    }
  }

  // ---------- เขียนไฟล์ summary ----------
  const csvPath = path.join(OUT_DIR, 'summary.csv');
  fs.writeFileSync(csvPath, summaryRows.map((r) => r.join(',')).join('\n'));
  console.log('\n>>> เขียนไฟล์', csvPath);

  // ---------- คำนวณค่ามัธยฐาน ----------
  const groups = {};
  for (const row of summaryRows.slice(1)) {
    const [pg, dv, , perf, lcp, cls, tbt, auth] = row;
    const key = `${pg}|${dv}`;
    if (!groups[key]) groups[key] = { perf: [], lcp: [], cls: [], tbt: [], auth };
    groups[key].perf.push(Number(perf));
    groups[key].lcp.push(Number(lcp));
    groups[key].cls.push(Number(cls));
    groups[key].tbt.push(Number(tbt));
  }
  function median(arr) {
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }
  const medianRows = [['page', 'device', 'performance_median', 'lcp_s_median', 'cls_median', 'tbt_ms_median', 'n_runs', 'used_auth']];
  for (const key of Object.keys(groups).sort()) {
    const [pg, dv] = key.split('|');
    const g = groups[key];
    medianRows.push([pg, dv, median(g.perf), median(g.lcp), median(g.cls), median(g.tbt), g.perf.length, g.auth]);
  }
  const medianPath = path.join(OUT_DIR, 'median_summary.csv');
  fs.writeFileSync(medianPath, medianRows.map((r) => r.join(',')).join('\n'));
  console.log('>>> เขียนไฟล์', medianPath);

  console.log('\n================================================================');
  console.log(' เสร็จสิ้น — ก่อนส่งกลับ เปิดดู report_flow/screenshots/bills_desktop_run1.png');
  console.log(' เองก่อนว่าเห็นหน้าบิลจริง ไม่ใช่หน้า signin');
  console.log('================================================================');
}

run().catch((e) => {
  console.error('เกิดข้อผิดพลาด:', e);
  process.exit(1);
});
