const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versionFilePath = path.join(__dirname, '..', 'lib', 'version.json');
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// 1. Read existing version or package.json
let baseVersion = 'v2.6.1';
let pkg = null;
try {
  if (fs.existsSync(packageJsonPath)) {
    pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (pkg.version) {
      baseVersion = pkg.version.startsWith('v') ? pkg.version : `v${pkg.version}`;
    }
  }
} catch (e) {}

let previousData = {
  baseVersion: baseVersion,
  buildNumber: 199,
  gitHash: 'fda5276',
  timestamp: '',
  updatedAt: '',
  fullDisplay: '',
  shortDisplay: ''
};

if (fs.existsSync(versionFilePath)) {
  try {
    const raw = fs.readFileSync(versionFilePath, 'utf8');
    previousData = JSON.parse(raw);
  } catch (e) {}
}

// 2. Get Git commit short hash (or fallback)
let gitHash = '';
try {
  gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
} catch (e) {
  gitHash = previousData.gitHash || Math.random().toString(36).substring(2, 8);
}

// 3. Get deterministic Git commit count as build number
let commitCount = 0;
try {
  commitCount = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim(), 10);
} catch (e) {}

const newBuildNumber = commitCount > 0 ? commitCount : (previousData.buildNumber || 199) + 1;

// 4. Format Date and Time
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`;
const timestampId = `${dateStr}.${timeStr}`;

const thaiDateStr = now.toLocaleDateString('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

const cleanBaseVersion = baseVersion.startsWith('v') ? baseVersion : `v${baseVersion}`;
const fullDisplay = `${cleanBaseVersion}.${newBuildNumber} (${gitHash})`;
const shortDisplay = `${cleanBaseVersion}-b${newBuildNumber}`;

const versionData = {
  baseVersion: cleanBaseVersion,
  buildNumber: newBuildNumber,
  gitHash: gitHash,
  timestamp: timestampId,
  updatedAt: thaiDateStr,
  fullDisplay: fullDisplay,
  shortDisplay: shortDisplay
};

fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2), 'utf8');

// Also sync version in package.json (without 'v' prefix)
if (pkg) {
  const semverOnly = cleanBaseVersion.replace(/^v/, '');
  if (pkg.version !== semverOnly) {
    pkg.version = semverOnly;
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf8');
  }
}

console.log(`🏷️ [Version Updated] -> ${shortDisplay} (${gitHash}) [${thaiDateStr}]`);

module.exports = versionData;
