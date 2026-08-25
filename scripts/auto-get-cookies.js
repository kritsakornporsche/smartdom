const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://kritsakorn.thddns.net:5993';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCookieFor(email, password) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    console.log(`Navigating to ${BASE_URL}/signin for ${email}...`);
    await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    const emailInput = await page.$('input[type="email"], input[placeholder*="you@example.com"], input[placeholder*="email" i]');
    const passInput = await page.$('input[type="password"]');
    if (!emailInput || !passInput) {
      throw new Error(`Inputs not found on signin page`);
    }

    await emailInput.click({ clickCount: 3 });
    await emailInput.press('Backspace');
    await emailInput.type(email, { delay: 20 });

    await passInput.click({ clickCount: 3 });
    await passInput.press('Backspace');
    await passInput.type(password, { delay: 20 });

    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 25000 }).catch(() => {});
    await sleep(3000);

    console.log(`Current URL after login for ${email}: ${page.url()}`);

    const cookies = await page.cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session-token'));
    if (sessionCookie) {
      console.log(`✅ Obtained cookie for ${email}: ${sessionCookie.name} = ${sessionCookie.value.substring(0, 20)}...`);
      return { name: sessionCookie.name, value: sessionCookie.value };
    } else {
      console.log(`⚠️ Cookies found:`, cookies.map(c => c.name));
      return null;
    }
  } finally {
    await browser.close();
  }
}

(async () => {
  try {
    console.log('🚀 Fetching session cookies automatically...');
    const ownerRes = await getCookieFor('owner@kaset2.com', 'Password123!');
    const tenantRes = await getCookieFor('tenant@kaset2.com', 'Password123!');

    if (ownerRes && tenantRes) {
      console.log('\n🎉 Successfully retrieved both cookies!');
      const cookieName = ownerRes.name;
      const ownerCookie = ownerRes.value;
      const tenantCookie = tenantRes.value;

      // Update run_lighthouse_final.sh
      const shPath = path.join(__dirname, 'run_lighthouse_final.sh');
      let content = fs.readFileSync(shPath, 'utf-8');
      content = content.replace(/OWNER_COOKIE_VALUE=".*?"/, `OWNER_COOKIE_VALUE="${ownerCookie}"`);
      content = content.replace(/TENANT_COOKIE_VALUE=".*?"/, `TENANT_COOKIE_VALUE="${tenantCookie}"`);
      content = content.replace(/COOKIE_NAME=".*?"/, `COOKIE_NAME="${cookieName}"`);
      fs.writeFileSync(shPath, content, 'utf-8');
      console.log(`💾 Updated scripts/run_lighthouse_final.sh with new cookies and cookie name (${cookieName}).`);
    } else {
      console.error('❌ Failed to retrieve one or both cookies');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
