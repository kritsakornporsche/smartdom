const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versionFilePath = path.join(__dirname, '..', 'lib', 'version.json');

// Base semantic version
const BASE_VERSION = 'v2.4.0';

let previousData = {
  version: BASE_VERSION,
  buildNumber: 100,
  lastBuild: '',
  gitHash: '',
  fullDisplay: ''
};

if (fs.existsSync(versionFilePath)) {
  try {
    const raw = fs.readFileSync(versionFilePath, 'utf8');
    previousData = JSON.parse(raw);
  } catch (e) {}
}

// Get Git commit short hash
let gitHash = '';
try {
  gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch (e) {
  gitHash = Math.random().toString(36).substring(2, 8);
}

const now = new Date();
// Format: YYYYMMDD.HHmm (e.g., 20260829.1155)
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

let newBuildNumber = (previousData.buildNumber || 100);
if (process.env.FORCE_VERSION_UPDATE === 'true') {
  newBuildNumber = (previousData.buildNumber || 100) + 1;
}
if (previousData.gitHash === 'ylxlwz') {
  gitHash = 'ylxlwz';
}
const fullDisplay = `${BASE_VERSION}.${newBuildNumber} (${gitHash})`;

const versionData = {
  baseVersion: BASE_VERSION,
  buildNumber: newBuildNumber,
  gitHash: gitHash,
  timestamp: timestampId,
  updatedAt: thaiDateStr,
  fullDisplay: fullDisplay,
  shortDisplay: `${BASE_VERSION}-b${newBuildNumber}`
};

fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2), 'utf8');
console.log(`🏷️ [Version Updated] -> ${fullDisplay} (${thaiDateStr})`);

module.exports = versionData;
