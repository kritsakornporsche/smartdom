const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'report', 'screenshots');
const TESTPHOTO_DIR = path.join(__dirname, '..', 'docs', 'testphoto');

const mapping = {
  'explore_desktop_run1.png': 'perf_lighthouse_desktop_explore.png',
  'explore_mobile_run1.png': 'perf_lighthouse_mobile_explore.png',
  'signin_desktop_run1.png': 'perf_lighthouse_desktop_signin.png',
  'signin_mobile_run1.png': 'perf_lighthouse_mobile_signin.png',
  'owner_desktop_run1.png': 'perf_lighthouse_desktop_owner.png',
  'owner_mobile_run1.png': 'perf_lighthouse_mobile_owner.png',
  'tenant_desktop_run1.png': 'perf_lighthouse_desktop_tenant.png',
  'tenant_mobile_run1.png': 'perf_lighthouse_mobile_tenant.png',
  'bills_desktop_run1.png': 'perf_lighthouse_desktop_bills.png',
  'bills_mobile_run1.png': 'perf_lighthouse_mobile_bills.png',
};

for (const [src, dest] of Object.entries(mapping)) {
  const srcPath = path.join(SCREENSHOTS_DIR, src);
  const destPath = path.join(TESTPHOTO_DIR, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Synced: ${src} -> docs/testphoto/${dest}`);
  }
}
